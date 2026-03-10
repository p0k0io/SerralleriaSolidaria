<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\VariantController;



Route::get('/test', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API funcionando correctamente'
    ]);
});

// Obtener todos los productos (activos e inactivos)
Route::get('/products', [ProductController::class, 'index']);

// Obtener un producto con sus variantes
Route::get('/products/{id}', [ProductController::class, 'show']);

// Crear producto
Route::post('/products', [ProductController::class, 'store']);

// Actualizar producto
Route::put('/products/{id}', [ProductController::class, 'update']);

// Borrar producto
Route::delete('/products/{id}', [ProductController::class, 'destroy']);



// Obtener todas las variantes
Route::get('/variants', [VariantController::class, 'index']);

// Obtener una variante específica
Route::get('/variants/{id}', [VariantController::class, 'show']);

// Crear variante
Route::post('/variants', [VariantController::class, 'store']);

// Actualizar variante
Route::put('/variants/{id}', [VariantController::class, 'update']);

// Borrar variante
Route::delete('/variants/{id}', [VariantController::class, 'destroy']);



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
