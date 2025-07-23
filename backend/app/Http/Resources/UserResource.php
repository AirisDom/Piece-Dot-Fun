<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'wallet_address' => $this->wallet_address,
            'profile_image' => $this->profile_image,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'postal_code' => $this->postal_code,
            'is_active' => $this->is_active,
            'program_account_id' => $this->program_account_id,
            'created_at_blockchain' => $this->created_at_blockchain,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Computed attributes
            'has_market' => $this->hasMarket(),
            'active_markets_count' => $this->activeMarkets->count(),
            'cart_items_count' => $this->cartItems->count(),
            'cart_total' => $this->cartTotal,
            'total_sales' => $this->totalSales,
            
            // Conditional includes
            'markets' => MarketResource::collection($this->whenLoaded('markets')),
            'cart_items' => CartItemResource::collection($this->whenLoaded('cartItems')),
            'orders' => OrderResource::collection($this->whenLoaded('orders')),
            'transactions' => TransactionResource::collection($this->whenLoaded('transactions'))
        ];
    }
}
