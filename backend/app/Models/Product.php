<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'market_id',
        'name',
        'description',
        'price',
        'stock_quantity',
        'category',
        'image_url',
        'images',
        'weight',
        'dimensions',
        'is_active',
        'metadata',
        'program_account_id',
        'sku'
    ];

    protected $casts = [
        'price' => 'decimal:8,2',
        'stock_quantity' => 'integer',
        'weight' => 'decimal:6,3',
        'dimensions' => 'array',
        'images' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean'
    ];

    public function market()
    {
        return $this->belongsTo(Market::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByMarket($query, $marketId)
    {
        return $query->where('market_id', $marketId);
    }

    public function isInStock($quantity = 1)
    {
        return $this->stock_quantity >= $quantity;
    }

    public function decreaseStock($quantity)
    {
        if ($this->isInStock($quantity)) {
            $this->decrement('stock_quantity', $quantity);
            return true;
        }
        return false;
    }

    public function increaseStock($quantity)
    {
        $this->increment('stock_quantity', $quantity);
    }

    public function getFormattedPriceAttribute()
    {
        return number_format($this->price, 2);
    }

    public function getMainImageAttribute()
    {
        return $this->image_url ?: ($this->images[0] ?? null);
    }
}
