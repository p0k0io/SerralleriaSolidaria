<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestModel extends Model
{
    protected $table = 'requests';

    protected $fillable = [
        'name',
        'email',
        'phone',        // 👈 NUEVO
        'description',
        'image',
        'status',
        'admin_note',   // 👈 NUEVO (reemplaza notes)
    ];
}