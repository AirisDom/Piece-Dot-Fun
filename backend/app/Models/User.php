<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'wallet_address',
        'profile_image',
        'phone',
        'address',
        'city',
        'country',
        'postal_code',
        'is_active',
        'program_account_id',
        'created_at_blockchain'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'created_at_blockchain' => 'datetime'
        ];
    }

    // Relationships
    public function markets()
    {
        return $this->hasMany(Market::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithWallet($query, $walletAddress)
    {
        return $query->where('wallet_address', $walletAddress);
    }

    // Methods
    public function getActiveMarketsAttribute()
    {
        return $this->markets()->active()->get();
    }

    public function getTotalSalesAttribute()
    {
        return $this->markets->sum('total_sales');
    }

    public function getCartTotalAttribute()
    {
        return $this->cartItems->sum('total');
    }

    public function hasMarket()
    {
        return $this->markets()->active()->exists();
    }
}
