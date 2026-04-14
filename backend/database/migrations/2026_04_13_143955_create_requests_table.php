<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();

            // ================= CLIENTE =================
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable(); // 👈 NUEVO

            // ================= DESCRIPCIÓN =================
            $table->text('description');

            // ================= IMAGEN =================
            $table->string('image')->nullable();

            // ================= ESTADO CRM =================
            $table->enum('status', [
                'new',
                'contacted',
                'quote_sent',
                'approved',
                'in_progress',
                'done',
                'rejected'
            ])->default('new');

            // ================= NOTA INTERNA ADMIN =================
            $table->text('admin_note')->nullable(); // 👈 NUEVO (MEJOR NOMBRE QUE "notes")

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};