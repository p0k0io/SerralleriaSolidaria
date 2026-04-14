<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestModel extends Model
{
    protected $table = 'requests'; 

    protected $fillable = [
        'name',
        'email',
        'description',
        'image',
        'status',
        'notes'
    ];
}