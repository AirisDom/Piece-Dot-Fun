<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartItemResource;
use App\Models\{CartItem, Product, Order};
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cartItems = CartItem::where('user_id', $request->user()->id)
                            ->with(['product.market'])
                            ->orderBy('added_at', 'desc')
                            ->get();

        $total = $cartItems->sum('total');
        $itemsCount = $cartItems->sum('quantity');

        return response()->json([
            'success' => true,
            'data' => [
                'items' => CartItemResource::collection($cartItems),
                'total' => $total,
                'items_count' => $itemsCount,
                'formatted_total' => number_format($total, 2)
            ]
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::findOrFail($request->product_id);

        // Check if product is active and in stock
        if (!$product->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Product is not available'
            ], 422);
        }

        if (!$product->isInStock($request->quantity)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available'
            ], 422);
        }

        try {
            // Check if item already exists in cart
            $existingCartItem = CartItem::where('user_id', $request->user()->id)
                                      ->where('product_id', $request->product_id)
                                      ->first();

            if ($existingCartItem) {
                // Update quantity
                $newQuantity = $existingCartItem->quantity + $request->quantity;
                
                if (!$product->isInStock($newQuantity)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot add more items. Insufficient stock available'
                    ], 422);
                }
                
                $existingCartItem->update(['quantity' => $newQuantity]);
                $cartItem = $existingCartItem;
            } else {
                // Create new cart item
                $cartItem = CartItem::create([
                    'user_id' => $request->user()->id,
                    'product_id' => $request->product_id,
                    'quantity' => $request->quantity
                ]);
            }

            $cartItem->load(['product.market']);

            return response()->json([
                'success' => true,
                'message' => 'Item added to cart successfully',
                'data' => new CartItemResource($cartItem)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check stock availability
        if (!$cartItem->product->isInStock($request->quantity)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available'
            ], 422);
        }

        $cartItem->update(['quantity' => $request->quantity]);
        $cartItem->load(['product.market']);

        return response()->json([
            'success' => true,
            'message' => 'Cart item updated successfully',
            'data' => new CartItemResource($cartItem)
        ]);
    }

    public function remove(CartItem $cartItem, Request $request): JsonResponse
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart successfully'
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        CartItem::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared successfully'
        ]);
    }

    public function checkout(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
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

        $cartItems = CartItem::where('user_id', $request->user()->id)
                            ->with(['product.market'])
                            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Group cart items by market
            $itemsByMarket = $cartItems->groupBy('product.market_id');
            $createdOrders = [];

            foreach ($itemsByMarket as $marketId => $marketItems) {
                // Validate stock for all items
                foreach ($marketItems as $cartItem) {
                    if (!$cartItem->product->isInStock($cartItem->quantity)) {
                        throw new \Exception("Insufficient stock for product: {$cartItem->product->name}");
                    }
                }

                // Create order for this market
                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'market_id' => $marketId,
                    'status' => Order::STATUS_PENDING,
                    'shipping_address' => $request->shipping_address,
                    'shipping_method' => $request->shipping_method,
                    'notes' => $request->notes,
                    'payment_status' => Order::PAYMENT_STATUS_PENDING,
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'shipping_amount' => 10.00,
                    'total_amount' => 0
                ]);

                $order->generateOrderNumber();

                // Create order items and decrease stock
                foreach ($marketItems as $cartItem) {
                    $order->orderItems()->create([
                        'product_id' => $cartItem->product_id,
                        'quantity' => $cartItem->quantity,
                        'price' => $cartItem->product->price,
                        'product_name' => $cartItem->product->name,
                        'product_description' => $cartItem->product->description,
                        'product_image' => $cartItem->product->main_image
                    ]);

                    $cartItem->product->decreaseStock($cartItem->quantity);
                }

                // Calculate totals
                $order->calculateTotals();
                $createdOrders[] = $order;
            }

            // Clear cart
            CartItem::where('user_id', $request->user()->id)->delete();

            DB::commit();

            // Load relationships for response
            foreach ($createdOrders as $order) {
                $order->load(['market', 'orderItems.product']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Checkout completed successfully',
                'data' => [
                    'orders' => $createdOrders,
                    'total_orders' => count($createdOrders)
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Checkout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
