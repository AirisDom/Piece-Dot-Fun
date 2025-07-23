<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Market>
 */
class MarketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'wallet_address' => $this->faker->regexify('[A-Za-z0-9]{32,44}'),
            'name' => $this->faker->company(),
            'description' => $this->faker->paragraph(3),
            'category' => $this->faker->randomElement([
                'Electronics', 'Fashion', 'Food', 'Books', 'Home & Garden',
                'Sports', 'Health', 'Beauty', 'Automotive', 'Art'
            ]),
            'location_address' => $this->faker->address(),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'shipping_radius' => $this->faker->numberBetween(10, 100),
            'is_active' => $this->faker->boolean(80),
            'metadata' => [
                'established' => $this->faker->year(),
                'specialties' => $this->faker->words(3)
            ],
            'program_account_id' => $this->faker->regexify('[A-Za-z0-9]{32,44}'),
            'created_at_blockchain' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'fee_percentage' => $this->faker->randomFloat(2, 1, 5)
        ];
    }

    /**
     * Indicate that the market is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the market is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
