<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'total',
        'product_name',
        'product_description',
        'product_image'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:8,2',
        'total' => 'decimal:8,2'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function calculateTotal()
    {
        $this->total = $this->quantity * $this->price;
        $this->save();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($orderItem) {
            if ($orderItem->product) {
                $orderItem->product_name = $orderItem->product->name;
                $orderItem->product_description = $orderItem->product->description;
                $orderItem->product_image = $orderItem->product->main_image;
                $orderItem->price = $orderItem->product->price;
            }
            $orderItem->calculateTotal();
        });

        static::updating(function ($orderItem) {
            $orderItem->calculateTotal();
        });
    }
}
