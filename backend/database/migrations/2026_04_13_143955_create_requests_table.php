<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();

            // CLIENTE
            $table->string('name');
            $table->string('email');
            $table->text('description');

            // IMAGEN DEL PROBLEMA
            $table->string('image')->nullable();

            // ESTADO CRM
            $table->enum('status', [
                'new',
                'contacted',
                'quote_sent',
                'approved',
                'in_progress',
                'done',
                'rejected'
            ])->default('new');

            // NOTAS ADMIN
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};