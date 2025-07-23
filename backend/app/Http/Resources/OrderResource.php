<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'market_id' => $this->market_id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'total_amount' => $this->total_amount,
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'shipping_amount' => $this->shipping_amount,
            'shipping_address' => $this->shipping_address,
            'shipping_method' => $this->shipping_method,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'payment_transaction_id' => $this->payment_transaction_id,
            'notes' => $this->notes,
            'delivered_at' => $this->delivered_at,
            'rating' => $this->rating,
            'review' => $this->review,
            'metadata' => $this->metadata,
            'program_account_id' => $this->program_account_id,
            'blockchain_transaction_hash' => $this->blockchain_transaction_hash,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Computed attributes
            'can_be_cancelled' => $this->canBeCancelled(),
            'can_be_rated' => $this->canBeRated(),
            'items_count' => $this->orderItems->count(),
            
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'market' => new MarketResource($this->whenLoaded('market')),
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'transactions' => TransactionResource::collection($this->whenLoaded('transactions'))
        ];
    }
}
