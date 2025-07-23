<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'market_id',
        'order_number',
        'status',
        'total_amount',
        'subtotal',
        'tax_amount',
        'shipping_amount',
        'shipping_address',
        'shipping_method',
        'payment_status',
        'payment_method',
        'payment_transaction_id',
        'notes',
        'delivered_at',
        'rating',
        'review',
        'metadata',
        'program_account_id',
        'blockchain_transaction_hash'
    ];

    protected $casts = [
        'total_amount' => 'decimal:8,2',
        'subtotal' => 'decimal:8,2',
        'tax_amount' => 'decimal:8,2',
        'shipping_amount' => 'decimal:8,2',
        'shipping_address' => 'array',
        'delivered_at' => 'datetime',
        'rating' => 'integer',
        'metadata' => 'array'
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED = 'refunded';

    const PAYMENT_STATUS_PENDING = 'pending';
    const PAYMENT_STATUS_PAID = 'paid';
    const PAYMENT_STATUS_FAILED = 'failed';
    const PAYMENT_STATUS_REFUNDED = 'refunded';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function market()
    {
        return $this->belongsTo(Market::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByMarket($query, $marketId)
    {
        return $query->where('market_id', $marketId);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function generateOrderNumber()
    {
        $this->order_number = 'ORD-' . strtoupper(uniqid());
        $this->save();
    }

    public function calculateTotals()
    {
        $this->subtotal = $this->orderItems->sum(function ($item) {
            return $item->quantity * $item->price;
        });
        
        $this->tax_amount = $this->subtotal * 0.10; // 10% tax
        $this->total_amount = $this->subtotal + $this->tax_amount + $this->shipping_amount;
        $this->save();
    }

    public function canBeCancelled()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    public function canBeRated()
    {
        return $this->status === self::STATUS_COMPLETED && !$this->rating;
    }

    public function markAsDelivered()
    {
        $this->status = self::STATUS_DELIVERED;
        $this->delivered_at = now();
        $this->save();
    }
}
