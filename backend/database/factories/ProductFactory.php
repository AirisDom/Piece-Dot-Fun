<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Market;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'market_id' => Market::factory(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(2),
            'price' => $this->faker->randomFloat(2, 5, 500),
            'stock_quantity' => $this->faker->numberBetween(0, 100),
            'category' => $this->faker->randomElement([
                'Electronics', 'Clothing', 'Books', 'Food', 'Home',
                'Sports', 'Health', 'Beauty', 'Toys', 'Art'
            ]),
            'image_url' => $this->faker->imageUrl(640, 480, 'products'),
            'images' => [
                $this->faker->imageUrl(640, 480, 'products'),
                $this->faker->imageUrl(640, 480, 'products')
            ],
            'weight' => $this->faker->randomFloat(3, 0.1, 50),
            'dimensions' => [
                'length' => $this->faker->numberBetween(1, 100),
                'width' => $this->faker->numberBetween(1, 100),
                'height' => $this->faker->numberBetween(1, 100),
                'unit' => 'cm'
            ],
            'is_active' => $this->faker->boolean(85),
            'metadata' => [
                'brand' => $this->faker->company(),
                'model' => $this->faker->word(),
                'features' => $this->faker->words(5)
            ],
            'program_account_id' => $this->faker->regexify('[A-Za-z0-9]{32,44}'),
            'sku' => 'SKU-' . strtoupper($this->faker->unique()->lexify('????????'))
        ];
    }

    /**
     * Indicate that the product is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the product is in stock.
     */
    public function inStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => $this->faker->numberBetween(1, 100),
        ]);
    }

    /**
     * Indicate that the product is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => 0,
        ]);
    }
}
