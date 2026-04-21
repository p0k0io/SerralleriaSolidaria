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
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('manufacturer')->nullable();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->boolean('active')->default(true);
            $table->decimal('shipping_price', 10, 2)->default(0);
            $table->decimal('installation_price', 10, 2)->default(0); 
            $table->enum('stock_status', ['available', 'out_of_stock', 'next_batch'])->default('available');
            $table->boolean('has_extra_keys')->default(false);
            $table->decimal('extra_key_price', 10, 2)->nullable();
            $table->timestamps();
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
