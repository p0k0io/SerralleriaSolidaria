<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\VariantController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\SqlController;

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

Route::post('/products-with-variants', [ProductController::class, 'storeWithVariants']);

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

Route::post('/variants/disable/{id}', [VariantController::class, 'disable']);

Route::post('/variants/enable/{id}', [VariantController::class, 'enable']);

Route::post('/products/enable/{id}', [ProductController::class, 'enable']);

// Obtener todas las categorías
Route::get('/categories', [CategoryController::class, 'index']);

// Obtener una categoría específica
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Crear categoría
Route::post('/categories', [CategoryController::class, 'store']);

// Actualizar categoría
Route::put('/categories/{id}', [CategoryController::class, 'update']);

// Borrar categoría
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

Route::post('/products/disable/{id}', [ProductController::class, 'disable']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/execute-sql', [SqlController::class, 'execute']);
