<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MarketResource extends JsonResource
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
            'user_id' => $this->user_id,
            'wallet_address' => $this->wallet_address,
            'name' => $this->name,
            'description' => $this->description,
            'category' => $this->category,
            'location_address' => $this->location_address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'shipping_radius' => $this->shipping_radius,
            'is_active' => $this->is_active,
            'metadata' => $this->metadata,
            'program_account_id' => $this->program_account_id,
            'created_at_blockchain' => $this->created_at_blockchain,
            'fee_percentage' => $this->fee_percentage,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Computed attributes
            'average_rating' => $this->averageRating,
            'total_sales' => $this->totalSales,
            'products_count' => $this->products->count(),
            'orders_count' => $this->orders->count(),
            
            // Relationships
            'owner' => new UserResource($this->whenLoaded('user')),
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'shipping_zones' => ShippingZoneResource::collection($this->whenLoaded('shippingZones')),
            'orders' => OrderResource::collection($this->whenLoaded('orders')),
            'transactions' => TransactionResource::collection($this->whenLoaded('transactions'))
        ];
    }
}
