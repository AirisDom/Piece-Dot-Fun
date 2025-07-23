<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'market_id',
        'order_id',
        'type',
        'status',
        'amount',
        'currency',
        'transaction_hash',
        'blockchain_signature',
        'from_wallet',
        'to_wallet',
        'gas_fee',
        'description',
        'metadata',
        'processed_at',
        'confirmed_at',
        'program_account_id'
    ];

    protected $casts = [
        'amount' => 'decimal:8,2',
        'gas_fee' => 'decimal:8,6',
        'metadata' => 'array',
        'processed_at' => 'datetime',
        'confirmed_at' => 'datetime'
    ];

    const TYPE_FUNDING = 'funding';
    const TYPE_WITHDRAWAL = 'withdrawal';
    const TYPE_PURCHASE = 'purchase';
    const TYPE_SALE = 'sale';
    const TYPE_REFUND = 'refund';
    const TYPE_FEE = 'fee';

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';

    const CURRENCY_SOL = 'SOL';
    const CURRENCY_USDC = 'USDC';
    const CURRENCY_TOKEN = 'TOKEN';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function market()
    {
        return $this->belongsTo(Market::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
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

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    public function scopeFunding($query)
    {
        return $query->where('type', self::TYPE_FUNDING);
    }

    public function scopeWithdrawals($query)
    {
        return $query->where('type', self::TYPE_WITHDRAWAL);
    }

    public function scopePurchases($query)
    {
        return $query->where('type', self::TYPE_PURCHASE);
    }

    public function scopeSales($query)
    {
        return $query->where('type', self::TYPE_SALE);
    }

    public function markAsConfirmed()
    {
        $this->status = self::STATUS_CONFIRMED;
        $this->confirmed_at = now();
        $this->save();
    }

    public function markAsFailed()
    {
        $this->status = self::STATUS_FAILED;
        $this->save();
    }

    public function getFormattedAmountAttribute()
    {
        return number_format((float)$this->amount, 2) . ' ' . $this->currency;
    }
}
