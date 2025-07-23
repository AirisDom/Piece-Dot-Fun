<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FunResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        // Customize as needed for user, market, transaction, etc.
        return parent::toArray($request);
    }
} 