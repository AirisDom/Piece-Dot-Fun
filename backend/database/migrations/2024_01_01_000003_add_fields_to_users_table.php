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
        Schema::table('users', function (Blueprint $table) {
            $table->string('wallet_address')->unique()->nullable()->after('email');
            $table->string('profile_image')->nullable()->after('wallet_address');
            $table->string('phone')->nullable()->after('profile_image');
            $table->text('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('country')->nullable()->after('city');
            $table->string('postal_code')->nullable()->after('country');
            $table->boolean('is_active')->default(true)->after('postal_code');
            $table->string('program_account_id')->nullable()->after('is_active');
            $table->timestamp('created_at_blockchain')->nullable()->after('program_account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
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
            ]);
        });
    }
};
