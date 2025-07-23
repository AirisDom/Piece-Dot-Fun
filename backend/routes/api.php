<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    UserController,
    MarketController,
    ProductController,
    OrderController,
    TransactionController,
    CartController,
    AuthController
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/wallet-login', [AuthController::class, 'walletLogin']);

// Public market data
Route::get('/markets', [MarketController::class, 'index']);
Route::get('/markets/{market}', [MarketController::class, 'show']);
Route::get('/markets/{market}/products', [ProductController::class, 'byMarket']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    
    // Users
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/activate', [UserController::class, 'activate']);
    Route::patch('/users/{user}/deactivate', [UserController::class, 'deactivate']);
    
    // Markets
    Route::apiResource('markets', MarketController::class)->except(['index', 'show']);
    Route::get('/my-markets', [MarketController::class, 'myMarkets']);
    Route::patch('/markets/{market}/activate', [MarketController::class, 'activate']);
    Route::patch('/markets/{market}/deactivate', [MarketController::class, 'deactivate']);
    Route::get('/markets/{market}/analytics', [MarketController::class, 'analytics']);
    
    // Products
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::get('/my-products', [ProductController::class, 'myProducts']);
    Route::patch('/products/{product}/activate', [ProductController::class, 'activate']);
    Route::patch('/products/{product}/deactivate', [ProductController::class, 'deactivate']);
    Route::patch('/products/{product}/stock', [ProductController::class, 'updateStock']);
    
    // Orders
    Route::apiResource('orders', OrderController::class);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    Route::get('/market-orders', [OrderController::class, 'marketOrders']);
    Route::patch('/orders/{order}/confirm', [OrderController::class, 'confirm']);
    Route::patch('/orders/{order}/ship', [OrderController::class, 'ship']);
    Route::patch('/orders/{order}/deliver', [OrderController::class, 'deliver']);
    Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::patch('/orders/{order}/rate', [OrderController::class, 'rate']);
    
    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::patch('/cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartController::class, 'remove']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    Route::post('/cart/checkout', [CartController::class, 'checkout']);
    
    // Transactions
    Route::apiResource('transactions', TransactionController::class)->only(['index', 'show']);
    Route::get('/my-transactions', [TransactionController::class, 'myTransactions']);
    Route::post('/transactions/funding', [TransactionController::class, 'funding']);
    Route::post('/transactions/withdrawal', [TransactionController::class, 'withdrawal']);
    Route::patch('/transactions/{transaction}/confirm', [TransactionController::class, 'confirm']);
    Route::get('/transactions/analytics', [TransactionController::class, 'analytics']);
});

// Webhook routes (for blockchain events)
Route::post('/webhooks/blockchain', [TransactionController::class, 'blockchainWebhook']);
