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
        Schema::create('markets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('wallet_address')->nullable();
            $table->string('name');
            $table->text('description');
            $table->string('category');
            $table->text('location_address');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('shipping_radius', 8, 2)->default(50);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->string('program_account_id')->nullable();
            $table->timestamp('created_at_blockchain')->nullable();
            $table->decimal('fee_percentage', 5, 2)->default(2.50);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['latitude', 'longitude']);
            $table->index('category');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('markets');
    }
};
