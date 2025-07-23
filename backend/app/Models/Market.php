<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Market extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'wallet_address',
        'name',
        'description',
        'category',
        'location_address',
        'latitude',
        'longitude',
        'shipping_radius',
        'is_active',
        'metadata',
        'program_account_id',
        'created_at_blockchain',
        'fee_percentage'
    ];

    protected $casts = [
        'metadata' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
        'fee_percentage' => 'decimal:4,2',
        'created_at_blockchain' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function shippingZones()
    {
        return $this->hasMany(ShippingZone::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithinRadius($query, $latitude, $longitude, $radiusKm)
    {
        return $query->selectRaw("
            *, 
            (6371 * acos(cos(radians(?)) 
            * cos(radians(latitude)) 
            * cos(radians(longitude) - radians(?)) 
            + sin(radians(?)) 
            * sin(radians(latitude)))) AS distance
        ", [$latitude, $longitude, $latitude])
        ->having('distance', '<', $radiusKm);
    }

    public function getAverageRatingAttribute()
    {
        return $this->orders()
            ->whereNotNull('rating')
            ->avg('rating');
    }

    public function getTotalSalesAttribute()
    {
        return $this->orders()
            ->where('status', 'completed')
            ->sum('total_amount');
    }
}
