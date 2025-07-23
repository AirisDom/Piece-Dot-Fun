<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'market_id' => $this->market_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'formatted_price' => $this->formattedPrice,
            'stock_quantity' => $this->stock_quantity,
            'category' => $this->category,
            'image_url' => $this->image_url,
            'images' => $this->images,
            'main_image' => $this->mainImage,
            'weight' => $this->weight,
            'dimensions' => $this->dimensions,
            'is_active' => $this->is_active,
            'metadata' => $this->metadata,
            'program_account_id' => $this->program_account_id,
            'sku' => $this->sku,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Computed attributes
            'in_stock' => $this->stock_quantity > 0,
            'orders_count' => $this->orderItems->count(),
            
            // Relationships
            'market' => new MarketResource($this->whenLoaded('market')),
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems'))
        ];
    }
}
