<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\{User, Market, Product, Order, Transaction, CartItem};
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@piecemarket.fun',
            'password' => Hash::make('password123'),
            'wallet_address' => 'AdminWallet123456789012345678901234567890',
            'phone' => '+1234567890',
            'address' => '123 Admin St',
            'city' => 'Admin City',
            'country' => 'USA',
            'postal_code' => '12345',
            'is_active' => true
        ]);

        // Create sample users with wallets
        $users = User::factory(20)->create([
            'wallet_address' => function() {
                return 'Wallet' . str_pad(rand(1, 999999999), 36, '0', STR_PAD_LEFT);
            }
        ]);

        // Add admin to users collection
        $allUsers = $users->prepend($admin);

        // Create markets for some users
        $markets = collect();
        foreach ($allUsers->random(8) as $user) {
            $userMarkets = Market::factory(rand(1, 2))->create([
                'user_id' => $user->id,
                'wallet_address' => $user->wallet_address
            ]);
            $markets = $markets->merge($userMarkets);
        }

        // Create products for each market
        foreach ($markets as $market) {
            Product::factory(rand(5, 15))->create([
                'market_id' => $market->id
            ]);
        }

        // Create some sample orders
        $activeUsers = $allUsers->where('is_active', true);
        foreach ($activeUsers->random(10) as $user) {
            $randomMarket = $markets->random();
            $marketProducts = $randomMarket->products()->active()->take(rand(1, 3))->get();
            
            if ($marketProducts->count() > 0) {
                $order = Order::create([
                    'user_id' => $user->id,
                    'market_id' => $randomMarket->id,
                    'order_number' => 'ORD-' . strtoupper(uniqid()),
                    'status' => collect(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'])->random(),
                    'shipping_address' => [
                        'street' => fake()->streetAddress(),
                        'city' => fake()->city(),
                        'postal_code' => fake()->postcode(),
                        'country' => fake()->country()
                    ],
                    'shipping_method' => 'standard',
                    'payment_status' => collect(['pending', 'paid', 'failed'])->random(),
                    'payment_method' => 'crypto',
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'shipping_amount' => 10.00,
                    'total_amount' => 0,
                    'rating' => rand(1, 5),
                    'review' => fake()->sentence()
                ]);

                // Create order items
                foreach ($marketProducts as $product) {
                    $quantity = rand(1, 3);
                    $order->orderItems()->create([
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'price' => $product->price,
                        'product_name' => $product->name,
                        'product_description' => $product->description,
                        'product_image' => $product->image_url
                    ]);
                }

                // Calculate order totals
                $order->calculateTotals();
            }
        }

        // Create some cart items for active users
        foreach ($activeUsers->random(5) as $user) {
            $randomProducts = Product::active()->take(rand(1, 5))->get();
            foreach ($randomProducts as $product) {
                if ($product->stock_quantity > 0) {
                    CartItem::create([
                        'user_id' => $user->id,
                        'product_id' => $product->id,
                        'quantity' => rand(1, min(3, $product->stock_quantity))
                    ]);
                }
            }
        }

        // Create sample transactions
        foreach ($allUsers->random(15) as $user) {
            // Funding transaction
            Transaction::create([
                'user_id' => $user->id,
                'type' => 'funding',
                'status' => 'confirmed',
                'amount' => rand(50, 1000),
                'currency' => collect(['SOL', 'USDC'])->random(),
                'transaction_hash' => 'tx_' . \Illuminate\Support\Str::random(64),
                'from_wallet' => $user->wallet_address,
                'to_wallet' => 'platform_wallet_address',
                'description' => 'Wallet funding',
                'confirmed_at' => now()->subDays(rand(1, 30))
            ]);

            // Maybe a purchase transaction
            if (rand(1, 100) <= 70) {
                Transaction::create([
                    'user_id' => $user->id,
                    'market_id' => $markets->random()->id,
                    'type' => 'purchase',
                    'status' => 'confirmed',
                    'amount' => rand(10, 200),
                    'currency' => 'SOL',
                    'transaction_hash' => 'tx_' . \Illuminate\Support\Str::random(64),
                    'from_wallet' => $user->wallet_address,
                    'to_wallet' => 'market_wallet_address',
                    'description' => 'Product purchase',
                    'confirmed_at' => now()->subDays(rand(1, 15))
                ]);
            }
        }

        echo "Database seeded successfully!\n";
        echo "Admin user: admin@piecemarket.fun / password123\n";
        echo "Created: " . User::count() . " users, " . Market::count() . " markets, " . Product::count() . " products\n";
        echo "Orders: " . Order::count() . ", Transactions: " . Transaction::count() . "\n";
    }
}
