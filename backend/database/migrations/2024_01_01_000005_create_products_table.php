<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('market_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->integer('stock_quantity')->default(0);
            $table->string('category');
            $table->string('image_url')->nullable();
            $table->json('images')->nullable();
            $table->decimal('weight', 8, 3)->nullable();
            $table->json('dimensions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->string('program_account_id')->nullable();
            $table->string('sku')->unique()->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
            $table->index('is_active');
            $table->index('stock_quantity');
            $table->index('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
