<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    protected $fillable = [
        'name',
        'email',
        'description',
        'image',
        'status',
        'notes'
    ];
}