<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Market;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['market'])->active();

        // Filter by category
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Filter by market
        if ($request->has('market_id')) {
            $query->byMarket($request->market_id);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by stock
        if ($request->has('in_stock') && $request->in_stock) {
            $query->inStock();
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total()
            ]
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['market.user', 'orderItems']);

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product)
        ]);
    }

    public function byMarket(Request $request, Market $market): JsonResponse
    {
        $query = $market->products()->with(['market'])->active();

        // Apply filters similar to index method
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('in_stock') && $request->in_stock) {
            $query->inStock();
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total()
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'market_id' => 'required|exists:markets,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category' => 'required|string',
            'image_url' => 'nullable|url',
            'images' => 'nullable|array',
            'images.*' => 'url',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|array',
            'sku' => 'nullable|string|unique:products,sku',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user owns the market
        $market = Market::findOrFail($request->market_id);
        if ($market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $product = Product::create([
                'market_id' => $request->market_id,
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'stock_quantity' => $request->stock_quantity,
                'category' => $request->category,
                'image_url' => $request->image_url,
                'images' => $request->images ?? [],
                'weight' => $request->weight,
                'dimensions' => $request->dimensions ?? [],
                'sku' => $request->sku ?? 'SKU-' . strtoupper(uniqid()),
                'metadata' => $request->metadata ?? [],
                'is_active' => true
            ]);

            DB::commit();

            $product->load(['market']);

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => new ProductResource($product)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        // Check if user owns the market
        if ($product->market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'category' => 'sometimes|string',
            'image_url' => 'sometimes|nullable|url',
            'images' => 'sometimes|nullable|array',
            'images.*' => 'url',
            'weight' => 'sometimes|nullable|numeric|min:0',
            'dimensions' => 'sometimes|nullable|array',
            'sku' => 'sometimes|nullable|string|unique:products,sku,' . $product->id,
            'metadata' => 'sometimes|nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $product->update($request->only([
            'name', 'description', 'price', 'stock_quantity', 'category',
            'image_url', 'images', 'weight', 'dimensions', 'sku', 'metadata'
        ]));

        $product->load(['market']);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => new ProductResource($product)
        ]);
    }

    public function destroy(Product $product, Request $request): JsonResponse
    {
        if ($product->market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    public function myProducts(Request $request): JsonResponse
    {
        $userMarketIds = Market::where('user_id', $request->user()->id)->pluck('id');
        
        $products = Product::whereIn('market_id', $userMarketIds)
            ->with(['market'])
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total()
            ]
        ]);
    }

    public function activate(Product $product, Request $request): JsonResponse
    {
        if ($product->market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $product->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Product activated successfully',
            'data' => new ProductResource($product)
        ]);
    }

    public function deactivate(Product $product, Request $request): JsonResponse
    {
        if ($product->market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $product->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Product deactivated successfully',
            'data' => new ProductResource($product)
        ]);
    }

    public function updateStock(Request $request, Product $product): JsonResponse
    {
        if ($product->market->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'stock_quantity' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $product->update(['stock_quantity' => $request->stock_quantity]);

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully',
            'data' => new ProductResource($product)
        ]);
    }
}
