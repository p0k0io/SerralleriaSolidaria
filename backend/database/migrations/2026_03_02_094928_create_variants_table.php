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
        Schema::create('variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('sku')->unique()->nullable();
            $table->decimal('price', 10, 2);
            $table->boolean('active')->default(true);
            $table->boolean('destacado')->default(false);
            $table->string('image')->nullable();

            // Stock como estado (puede sobreescribir al del producto si se desea)
            // 'available' | 'out_of_stock' | 'next_batch'
            $table->enum('stock_status', ['available', 'out_of_stock', 'next_batch'])->default('available');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variants');
    }
};
