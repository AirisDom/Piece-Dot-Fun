<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Resources\FunResource;
use App\Models\{User, Market, Product, Order, Transaction};

class FunController extends Controller
{
    public function users()
    {
        $users = User::with(['markets', 'orders', 'transactions'])->get();
        return FunResource::collection($users);
    }

    public function markets()
    {
        $markets = Market::with(['user', 'products', 'orders'])->active()->get();
        return FunResource::collection($markets);
    }

    public function products()
    {
        $products = Product::with(['market', 'orderItems'])->active()->get();
        return FunResource::collection($products);
    }

    public function orders()
    {
        $orders = Order::with(['user', 'market', 'orderItems'])->get();
        return FunResource::collection($orders);
    }

    public function transactions()
    {
        $transactions = Transaction::with(['user', 'market', 'order'])->get();
        return FunResource::collection($transactions);
    }

    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::active()->count(),
            'total_markets' => Market::count(),
            'active_markets' => Market::active()->count(),
            'total_products' => Product::count(),
            'active_products' => Product::active()->count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::pending()->count(),
            'completed_orders' => Order::completed()->count(),
            'total_transactions' => Transaction::count(),
            'confirmed_transactions' => Transaction::confirmed()->count(),
            'total_sales' => Order::completed()->sum('total_amount'),
            'monthly_sales' => Order::completed()
                ->whereMonth('created_at', now()->month)
                ->sum('total_amount'),
            'weekly_sales' => Order::completed()
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->sum('total_amount')
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function searchMarkets(Request $request)
    {
        $query = Market::with(['user', 'products'])->active();

        if ($request->has(['latitude', 'longitude', 'radius'])) {
            $query->withinRadius(
                $request->latitude,
                $request->longitude,
                $request->radius ?? 50
            );
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $markets = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => FunResource::collection($markets->items()),
            'meta' => [
                'current_page' => $markets->currentPage(),
                'last_page' => $markets->lastPage(),
                'total' => $markets->total()
            ]
        ]);
    }
} 