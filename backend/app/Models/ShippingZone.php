<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'market_id',
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
        'radius_km',
        'shipping_cost',
        'delivery_time_days',
        'is_active'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'radius_km' => 'decimal:6,2',
        'shipping_cost' => 'decimal:8,2',
        'delivery_time_days' => 'integer',
        'is_active' => 'boolean'
    ];

    public function market()
    {
        return $this->belongsTo(Market::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function isWithinZone($latitude, $longitude)
    {
        $distance = $this->calculateDistance($latitude, $longitude);
        return $distance <= $this->radius_km;
    }

    public function calculateDistance($latitude, $longitude)
    {
        $earthRadius = 6371; // km

        $latDiff = deg2rad($latitude - $this->latitude);
        $lonDiff = deg2rad($longitude - $this->longitude);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
             cos(deg2rad($this->latitude)) * cos(deg2rad($latitude)) *
             sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
