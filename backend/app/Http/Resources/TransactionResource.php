<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
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
            'order_id' => $this->order_id,
            'type' => $this->type,
            'status' => $this->status,
            'amount' => $this->amount,
            'formatted_amount' => $this->formattedAmount,
            'currency' => $this->currency,
            'transaction_hash' => $this->transaction_hash,
            'blockchain_signature' => $this->blockchain_signature,
            'from_wallet' => $this->from_wallet,
            'to_wallet' => $this->to_wallet,
            'gas_fee' => $this->gas_fee,
            'description' => $this->description,
            'metadata' => $this->metadata,
            'processed_at' => $this->processed_at,
            'confirmed_at' => $this->confirmed_at,
            'program_account_id' => $this->program_account_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'market' => new MarketResource($this->whenLoaded('market')),
            'order' => new OrderResource($this->whenLoaded('order'))
        ];
    }
}
