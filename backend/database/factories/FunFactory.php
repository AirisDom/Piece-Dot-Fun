<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\User;

class FunFactory extends Factory
{
    protected $model = User::class;

    public function definition()
    {
        return [
            'username' => $this->faker->userName,
            'email' => $this->faker->unique()->safeEmail,
            'public_key' => Str::random(32),
            'password' => bcrypt('password'),
            'phone' => $this->faker->phoneNumber,
            'bio' => $this->faker->sentence,
            'avatar_url' => $this->faker->imageUrl(200, 200, 'people'),
        ];
    }

    // Add more states or methods for markets, transactions, etc.
} 