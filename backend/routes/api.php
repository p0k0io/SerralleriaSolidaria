<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\VariantController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\SqlController;
use App\Http\Controllers\Api\PackController;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\DashboardController;

Route::get('/test', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API funcionando correctamente'
    ]);
});

// Obtener todos los productos (activos e inactivos)
Route::get('/products', [ProductController::class, 'index']);

Route::get('/variants/active', [VariantController::class, 'getActiveVariants']);


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
//Desactivar Variante
Route::post('/variants/disable/{id}', [VariantController::class, 'disable']);
//Activar Variante
Route::post('/variants/enable/{id}', [VariantController::class, 'enable']);
//Activar producto
Route::post('/products/enable/{id}', [ProductController::class, 'enable']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

Route::post('/products/disable/{id}', [ProductController::class, 'disable']);


Route::get('/dashboard', [DashboardController::class, 'index']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/execute-sql', [SqlController::class, 'execute']);

Route::apiResource('packs', PackController::class);

Route::get('/variants/active', [VariantController::class, 'getActiveVariants']);

Route::post('/packs/enable/{id}', [PackController::class, 'enable']);
Route::post('/packs/disable/{id}', [PackController::class, 'disable']);

//Autentificacion

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);
});
