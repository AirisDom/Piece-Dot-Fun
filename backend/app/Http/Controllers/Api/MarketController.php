<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MarketResource;
use App\Models\Market;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class MarketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Market::with(['user', 'products' => function($q) {
            $q->active()->limit(5);
        }])->active();

        // Filter by location if provided
        if ($request->has(['latitude', 'longitude', 'radius'])) {
            $query->withinRadius(
                $request->latitude,
                $request->longitude,
                $request->radius ?? 50
            );
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $markets = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => MarketResource::collection($markets->items()),
            'meta' => [
                'current_page' => $markets->currentPage(),
                'last_page' => $markets->lastPage(),
                'per_page' => $markets->perPage(),
                'total' => $markets->total()
            ]
        ]);
    }

    public function show(Market $market): JsonResponse
    {
        $market->load(['user', 'products.orderItems', 'shippingZones', 'orders']);

        return response()->json([
            'success' => true,
            'data' => new MarketResource($market)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'location_address' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'shipping_radius' => 'required|numeric|min:1|max:500',
            'wallet_address' => 'nullable|string',
            'fee_percentage' => 'nullable|numeric|between:0,100',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $market = Market::create([
                'user_id' => $request->user()->id,
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'location_address' => $request->location_address,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'shipping_radius' => $request->shipping_radius,
                'wallet_address' => $request->wallet_address ?? $request->user()->wallet_address,
                'fee_percentage' => $request->fee_percentage ?? 2.5,
                'metadata' => $request->metadata ?? [],
                'is_active' => true
            ]);

            DB::commit();

            $market->load(['user', 'products']);

            return response()->json([
                'success' => true,
                'message' => 'Market created successfully',
                'data' => new MarketResource($market)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create market',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Market $market): JsonResponse
    {
        // Check if user owns the market
        if ($market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'sometimes|string',
            'location_address' => 'sometimes|string',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'shipping_radius' => 'sometimes|numeric|min:1|max:500',
            'fee_percentage' => 'sometimes|numeric|between:0,100',
            'metadata' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $market->update($request->only([
            'name', 'description', 'category', 'location_address',
            'latitude', 'longitude', 'shipping_radius', 'fee_percentage', 'metadata'
        ]));

        $market->load(['user', 'products']);

        return response()->json([
            'success' => true,
            'message' => 'Market updated successfully',
            'data' => new MarketResource($market)
        ]);
    }

    public function destroy(Market $market, Request $request): JsonResponse
    {
        if ($market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $market->delete();

        return response()->json([
            'success' => true,
            'message' => 'Market deleted successfully'
        ]);
    }

    public function myMarkets(Request $request): JsonResponse
    {
        $markets = Market::where('user_id', $request->user()->id)
            ->with(['products', 'orders'])
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => MarketResource::collection($markets->items()),
            'meta' => [
                'current_page' => $markets->currentPage(),
                'last_page' => $markets->lastPage(),
                'per_page' => $markets->perPage(),
                'total' => $markets->total()
            ]
        ]);
    }

    public function activate(Market $market, Request $request): JsonResponse
    {
        if ($market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $market->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Market activated successfully',
            'data' => new MarketResource($market)
        ]);
    }

    public function deactivate(Market $market, Request $request): JsonResponse
    {
        if ($market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $market->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Market deactivated successfully',
            'data' => new MarketResource($market)
        ]);
    }

    public function analytics(Market $market, Request $request): JsonResponse
    {
        if ($market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $analytics = [
            'total_sales' => $market->totalSales,
            'total_orders' => $market->orders()->count(),
            'total_products' => $market->products()->count(),
            'active_products' => $market->products()->active()->count(),
            'average_rating' => $market->averageRating,
            'pending_orders' => $market->orders()->pending()->count(),
            'completed_orders' => $market->orders()->completed()->count(),
            'monthly_sales' => $market->orders()
                ->completed()
                ->whereMonth('created_at', now()->month)
                ->sum('total_amount'),
            'weekly_sales' => $market->orders()
                ->completed()
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->sum('total_amount')
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics
        ]);
    }
}
