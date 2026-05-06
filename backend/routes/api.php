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
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\OrderController;

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
        'message' => 'API funcionando correctamente',
    ]);
});

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products', [ProductController::class, 'store']);
Route::post('/products/products-with-variants', [ProductController::class, 'storeWithVariants']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::post('/products/enable/{id}', [ProductController::class, 'enable']);
Route::post('/products/disable/{id}', [ProductController::class, 'disable']);
Route::post('/products/{id}/variants', [ProductController::class, 'addVariant']);

/*
|--------------------------------------------------------------------------
| REQUESTS
|--------------------------------------------------------------------------
*/

Route::get('/requests', [RequestController::class, 'index']);
Route::post('/requests', [RequestController::class, 'store']);
Route::get('/requests/{id}', [RequestController::class, 'show']);
Route::delete('/requests/{id}', [RequestController::class, 'destroy']);
Route::get('/requests/status/{status}', [RequestController::class, 'filterByStatus']);
Route::get('/requests/date-range', [RequestController::class, 'filterByDateRange']);
Route::get('/requests/search', [RequestController::class, 'searchByCustomerName']);
Route::get('/requests/summary', [RequestController::class, 'summaryByStatus']);
Route::get('/requests/{id}/pdf', [RequestController::class, 'generatePdf']);
Route::get('/requests/{id}/email', [RequestController::class, 'sendEmailNotification']);

/*
|--------------------------------------------------------------------------
| VARIANTS
|--------------------------------------------------------------------------
*/

Route::prefix('variants')->group(function () {
    Route::get('/active', [VariantController::class, 'getActiveVariants']);
    Route::get('/search', [VariantController::class, 'search']);
    Route::get('/', [VariantController::class, 'index']);
    Route::post('/', [VariantController::class, 'store']);
    Route::get('/{id}', [VariantController::class, 'show']);
    Route::put('/{id}', [VariantController::class, 'update']);
    Route::delete('/{id}', [VariantController::class, 'destroy']);
    Route::post('/enable/{id}', [VariantController::class, 'enable']);
    Route::post('/disable/{id}', [VariantController::class, 'disable']);
    Route::post('/{id}/toggle', [VariantController::class, 'toggleActive']);
    Route::post('/{id}/toggle-featured', [VariantController::class, 'toggleFeatured']);
    Route::patch('/{id}/stock', [VariantController::class, 'updateStock']);
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
    Route::get('/', [AttributeTypeController::class, 'index']);
    Route::post('/', [AttributeTypeController::class, 'store']);
    Route::get('/{id}', [AttributeTypeController::class, 'show']);
    Route::put('/{id}', [AttributeTypeController::class, 'update']);
    Route::delete('/{id}', [AttributeTypeController::class, 'destroy']);
    Route::post('/values', [AttributeValueController::class, 'store']);
    Route::put('/values/{id}', [AttributeValueController::class, 'update']);
    Route::delete('/values/{id}', [AttributeValueController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| ORDERS
|--------------------------------------------------------------------------
*/

Route::prefix('orders')->group(function () {
    Route::get('/prepared', [OrderController::class, 'getPreparedOrders']);
    Route::get('/{id}', [OrderController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', [DashboardController::class, 'index']);
Route::get('/dashboard/monthly-sales', [DashboardController::class, 'monthlySales']);
Route::get('/dashboard/daily-sales', [DashboardController::class, 'dailySales']);
Route::get('/dashboard/hourly-sales', [DashboardController::class, 'hourlySales']);

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
| STRIPE / CHECKOUT (público)
|--------------------------------------------------------------------------
*/

Route::get('/stripe/session/{id}', [PaymentController::class, 'checkSession']);
Route::post('/stripe/webhook', [PaymentController::class, 'webhook']);

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
    Route::post('/checkout', [PaymentController::class, 'checkout']);


    /*
    |--------------------------------------------------------------------------
    | ADMIN — ORDERS
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::put('/orders/{id}', [OrderController::class, 'update']);
        Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    });
});
