<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\VariantController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PackController;
use App\Http\Controllers\Api\AttributeTypeController;
use App\Http\Controllers\Api\AttributeValueController;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SqlController;

/*
|--------------------------------------------------------------------------
| TEST
|--------------------------------------------------------------------------
*/

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

// Rutas adicionales para productos
Route::post('/products/enable/{id}', [ProductController::class, 'enable']);
Route::post('/products/disable/{id}', [ProductController::class, 'disable']);
Route::post('/products/products-with-variants', [ProductController::class, 'storeWithVariants']);
Route::post('/products/{id}/variants', [ProductController::class, 'addVariant']);

/*
|--------------------------------------------------------------------------
| VARIANTS
|--------------------------------------------------------------------------
*/

Route::prefix('variants')->group(function () {

    Route::get('/', [VariantController::class, 'index']);
    Route::get('/active', [VariantController::class, 'getActiveVariants']); // ✅ única
    Route::get('/{id}', [VariantController::class, 'show']);

    Route::post('/', [VariantController::class, 'store']);
    Route::put('/{id}', [VariantController::class, 'update']);
    Route::delete('/{id}', [VariantController::class, 'destroy']);

    Route::post('/disable/{id}', [VariantController::class, 'disable']);
    Route::post('/enable/{id}', [VariantController::class, 'enable']);

    Route::post('/{id}/toggle', [VariantController::class, 'toggleActive']);
});

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

Route::prefix('categories')->group(function () {

    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{id}', [CategoryController::class, 'show']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::put('/{id}', [CategoryController::class, 'update']);
    Route::delete('/{id}', [CategoryController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| PACKS
|--------------------------------------------------------------------------
*/

Route::apiResource('packs', PackController::class);

Route::post('/packs/enable/{id}', [PackController::class, 'enable']);
Route::post('/packs/disable/{id}', [PackController::class, 'disable']);

/*
|--------------------------------------------------------------------------
| ATTRIBUTES
|--------------------------------------------------------------------------
*/

Route::prefix('attributes')->group(function () {

    // Attribute Types
    Route::get('/', [AttributeTypeController::class, 'index']);
    Route::post('/', [AttributeTypeController::class, 'store']);
    Route::get('/{id}', [AttributeTypeController::class, 'show']);
    Route::put('/{id}', [AttributeTypeController::class, 'update']);
    Route::delete('/{id}', [AttributeTypeController::class, 'destroy']);

    // Attribute Values
    Route::post('/values', [AttributeValueController::class, 'store']);
    Route::put('/values/{id}', [AttributeValueController::class, 'update']);
    Route::delete('/values/{id}', [AttributeValueController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', [DashboardController::class, 'index']);

/*
|--------------------------------------------------------------------------
| SQL (CUIDADO EN PRODUCCIÓN)
|--------------------------------------------------------------------------
*/

Route::post('/execute-sql', [SqlController::class, 'execute']);

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| CHECKOUT
|--------------------------------------------------------------------------
*/

Route::post('/checkout', [PaymentController::class, 'checkout']);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (SANCTUM)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);
});