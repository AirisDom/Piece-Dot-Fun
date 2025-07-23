<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\{OrderResource, OrderItemResource};
use App\Models\{Order, OrderItem, Product, Market};
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'market', 'orderItems.product']);

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by market
        if ($request->has('market_id')) {
            $query->byMarket($request->market_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->byUser($request->user_id);
        }

        $orders = $query->orderBy('created_at', 'desc')
                       ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total()
            ]
        ]);
    }

    public function show(Order $order, Request $request): JsonResponse
    {
        // Users can only view their own orders or orders from their markets
        $user = $request->user();
        $userMarketIds = Market::where('user_id', $user->id)->pluck('id');
        
        if ($order->user_id !== $user->id && !$userMarketIds->contains($order->market_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $order->load(['user', 'market', 'orderItems.product', 'transactions']);

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'market_id' => 'required|exists:markets,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|array',
            'shipping_address.street' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.postal_code' => 'required|string',
            'shipping_address.country' => 'required|string',
            'shipping_method' => 'nullable|string',
            'notes' => 'nullable|string'
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

            // Validate stock availability
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                if (!$product->isInStock($item['quantity'])) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }
                if ($product->market_id !== $request->market_id) {
                    throw new \Exception("Product does not belong to the specified market");
                }
            }

            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'market_id' => $request->market_id,
                'status' => Order::STATUS_PENDING,
                'shipping_address' => $request->shipping_address,
                'shipping_method' => $request->shipping_method,
                'notes' => $request->notes,
                'payment_status' => Order::PAYMENT_STATUS_PENDING,
                'subtotal' => 0,
                'tax_amount' => 0,
                'shipping_amount' => 10.00, // Default shipping
                'total_amount' => 0
            ]);

            $order->generateOrderNumber();

            // Create order items and decrease stock
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'product_name' => $product->name,
                    'product_description' => $product->description,
                    'product_image' => $product->main_image
                ]);

                $product->decreaseStock($item['quantity']);
            }

            // Calculate totals
            $order->calculateTotals();

            DB::commit();

            $order->load(['user', 'market', 'orderItems.product']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => new OrderResource($order)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function myOrders(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
                      ->with(['market', 'orderItems.product'])
                      ->orderBy('created_at', 'desc')
                      ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total()
            ]
        ]);
    }

    public function marketOrders(Request $request): JsonResponse
    {
        $userMarketIds = Market::where('user_id', $request->user()->id)->pluck('id');
        
        $orders = Order::whereIn('market_id', $userMarketIds)
                      ->with(['user', 'market', 'orderItems.product'])
                      ->orderBy('created_at', 'desc')
                      ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total()
            ]
        ]);
    }

    public function confirm(Order $order, Request $request): JsonResponse
    {
        if ($order->market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (!$order->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be confirmed in current status'
            ], 422);
        }

        $order->update(['status' => Order::STATUS_CONFIRMED]);

        return response()->json([
            'success' => true,
            'message' => 'Order confirmed successfully',
            'data' => new OrderResource($order)
        ]);
    }

    public function ship(Order $order, Request $request): JsonResponse
    {
        if ($order->market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'tracking_number' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $metadata = $order->metadata ?? [];
        if ($request->tracking_number) {
            $metadata['tracking_number'] = $request->tracking_number;
        }

        $order->update([
            'status' => Order::STATUS_SHIPPED,
            'metadata' => $metadata
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order marked as shipped',
            'data' => new OrderResource($order)
        ]);
    }

    public function deliver(Order $order, Request $request): JsonResponse
    {
        if ($order->market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $order->markAsDelivered();

        return response()->json([
            'success' => true,
            'message' => 'Order marked as delivered',
            'data' => new OrderResource($order)
        ]);
    }

    public function cancel(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Users can cancel their own orders or market owners can cancel orders
        if ($order->user_id !== $user->id && $order->market->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (!$order->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled in current status'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Restore stock
            foreach ($order->orderItems as $item) {
                $item->product->increaseStock($item->quantity);
            }

            $order->update(['status' => Order::STATUS_CANCELLED]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => new OrderResource($order)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function rate(Order $order, Request $request): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (!$order->canBeRated()) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be rated'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|between:1,5',
            'review' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order->update([
            'rating' => $request->rating,
            'review' => $request->review,
            'status' => Order::STATUS_COMPLETED
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order rated successfully',
            'data' => new OrderResource($order)
        ]);
    }
}
