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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('market_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['funding', 'withdrawal', 'purchase', 'sale', 'refund', 'fee']);
            $table->enum('status', ['pending', 'processing', 'confirmed', 'failed', 'cancelled'])->default('pending');
            $table->decimal('amount', 18, 8);
            $table->string('currency', 10)->default('SOL');
            $table->string('transaction_hash')->nullable();
            $table->string('blockchain_signature')->nullable();
            $table->string('from_wallet')->nullable();
            $table->string('to_wallet')->nullable();
            $table->decimal('gas_fee', 18, 8)->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->string('program_account_id')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('status');
            $table->index('transaction_hash');
            $table->index('currency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
