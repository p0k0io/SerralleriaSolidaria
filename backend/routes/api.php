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
use App\Http\Controllers\OrderItemsController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SqlController;

/*
|--------------------------------------------------------------------------
| TEST
|--------------------------------------------------------------------------
*/

Route::get('/test', fn () => response()->json([
    'status'  => 'ok',
    'message' => 'API funcionando correctamente',
]));

/*
|--------------------------------------------------------------------------
| AUTH (público)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| STRIPE / WEBHOOKS (público — Stripe no manda token Bearer)
|--------------------------------------------------------------------------
*/

Route::get('/stripe/session/{id}', [PaymentController::class, 'checkSession']);
Route::post('/stripe/webhook',     [PaymentController::class, 'stripeWebhook']);

/*
|--------------------------------------------------------------------------
| TRACKING DE PEDIDO (público — el cliente busca por TRK-XXXXXXXX)
|--------------------------------------------------------------------------
*/

Route::get('/orders/track/{tracking}', [OrderController::class, 'track']);

/*
|--------------------------------------------------------------------------
| CATÁLOGO — lectura pública
|--------------------------------------------------------------------------
*/

Route::get('/products',               [ProductController::class, 'index']);
Route::get('/products/featured',      [ProductController::class, 'featured']);
Route::get('/products/search',        [ProductController::class, 'search']);
Route::get('/products/{id}',          [ProductController::class, 'show']);

Route::prefix('variants')->group(function () {
    Route::get('/active',  [VariantController::class, 'getActiveVariants']);
    Route::get('/search',  [VariantController::class, 'search']);
    Route::get('/',        [VariantController::class, 'index']);
    Route::get('/{id}',    [VariantController::class, 'show']);
});

Route::prefix('categories')->group(function () {
    Route::get('/',      [CategoryController::class, 'index']);
    Route::get('/{id}',  [CategoryController::class, 'show']);
});

Route::prefix('attributes')->group(function () {
    Route::get('/',      [AttributeTypeController::class, 'index']);
    Route::get('/{id}',  [AttributeTypeController::class, 'show']);
});

Route::apiResource('packs', PackController::class)->only(['index', 'show']);

// Solicitudes — cualquiera puede enviar una (formulario público)
Route::post('/requests', [RequestController::class, 'store']);

/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS — usuario autenticado (cualquier rol)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user',    fn (Request $r) => $r->user());
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/checkout', [PaymentController::class, 'checkout']);

    // Perfil
    Route::get('/profile',          [ProfileController::class, 'show']);
    Route::put('/profile',          [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Carrito
    Route::get('/cart',          [CartController::class, 'index']);
    Route::post('/cart',         [CartController::class, 'store']);
    Route::put('/cart/{id}',     [CartController::class, 'update']);
    Route::delete('/cart/{id}',  [CartController::class, 'destroy']);
    Route::delete('/cart-clear', [CartController::class, 'clear']);

    // Mis pedidos (cliente)
    Route::get('/orders/my',      [OrderController::class, 'myOrders']);
    Route::get('/orders/my/{id}', [OrderController::class, 'myOrderDetail']);

    // Order items — el cliente puede ver los suyos
    Route::get('/orders/{order}/items',        [OrderItemsController::class, 'index']);
    Route::get('/orders/{order}/items/{item}', [OrderItemsController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | RUTAS ADMIN — requiere auth:sanctum + role === admin
    |--------------------------------------------------------------------------
    */

    Route::middleware('admin')->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard',               [DashboardController::class, 'index']);
        Route::get('/dashboard/monthly-sales', [DashboardController::class, 'monthlySales']);
        Route::get('/dashboard/daily-sales',   [DashboardController::class, 'dailySales']);
        Route::get('/dashboard/hourly-sales',  [DashboardController::class, 'hourlySales']);

        // Productos (escritura)
        Route::post('/products',                        [ProductController::class, 'store']);
        Route::post('/products/products-with-variants', [ProductController::class, 'storeWithVariants']);
        Route::put('/products/{id}',                    [ProductController::class, 'update']);
        Route::delete('/products/{id}',                 [ProductController::class, 'destroy']);
        Route::post('/products/enable/{id}',            [ProductController::class, 'enable']);
        Route::post('/products/disable/{id}',           [ProductController::class, 'disable']);
        Route::post('/products/{id}/variants',          [ProductController::class, 'addVariant']);
        Route::post('/enhance-image',                   [ProductController::class, 'enhanceImage']);

        // Variantes (escritura)
        Route::post('/variants',                      [VariantController::class, 'store']);
        Route::put('/variants/{id}',                  [VariantController::class, 'update']);
        Route::delete('/variants/{id}',               [VariantController::class, 'destroy']);
        Route::post('/variants/enable/{id}',          [VariantController::class, 'enable']);
        Route::post('/variants/disable/{id}',         [VariantController::class, 'disable']);
        Route::post('/variants/{id}/toggle',          [VariantController::class, 'toggleActive']);
        Route::post('/variants/{id}/toggle-featured', [VariantController::class, 'toggleFeatured']);
        Route::patch('/variants/{id}/stock',          [VariantController::class, 'updateStock']);

        // Categorías (escritura)
        Route::post('/categories',        [CategoryController::class, 'store']);
        Route::put('/categories/{id}',    [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Packs (escritura)
        Route::post('/packs',             [PackController::class, 'store']);
        Route::put('/packs/{id}',         [PackController::class, 'update']);
        Route::delete('/packs/{id}',      [PackController::class, 'destroy']);
        Route::post('/packs/enable/{id}', [PackController::class, 'enable']);
        Route::post('/packs/disable/{id}',[PackController::class, 'disable']);

        // Atributos (escritura)
        Route::post('/attributes',              [AttributeTypeController::class, 'store']);
        Route::put('/attributes/{id}',          [AttributeTypeController::class, 'update']);
        Route::delete('/attributes/{id}',       [AttributeTypeController::class, 'destroy']);
        Route::post('/attributes/values',       [AttributeValueController::class, 'store']);
        Route::put('/attributes/values/{id}',   [AttributeValueController::class, 'update']);
        Route::delete('/attributes/values/{id}',[AttributeValueController::class, 'destroy']);

        // Solicitudes (gestión)
        Route::get('/requests',                   [RequestController::class, 'index']);
        Route::get('/requests/{id}',              [RequestController::class, 'show']);
        Route::delete('/requests/{id}',           [RequestController::class, 'destroy']);
        Route::get('/requests/status/{status}',   [RequestController::class, 'filterByStatus']);
        Route::get('/requests/date-range',        [RequestController::class, 'filterByDateRange']);
        Route::get('/requests/search',            [RequestController::class, 'searchByCustomerName']);
        Route::get('/requests/summary',           [RequestController::class, 'summaryByStatus']);
        Route::get('/requests/{id}/pdf',          [RequestController::class, 'generatePdf']);
        Route::get('/requests/{id}/email',        [RequestController::class, 'sendEmailNotification']);

        // Órdenes (gestión completa)
        Route::get('/orders',                               [OrderController::class, 'index']);
        Route::get('/orders/prepared',                      [OrderController::class, 'getPreparedOrders']);
        Route::get('/orders/{id}',                          [OrderController::class, 'show']);
        Route::put('/orders/{id}',                          [OrderController::class, 'update']);
        Route::delete('/orders/{id}',                       [OrderController::class, 'destroy']);
        Route::delete('/orders/{order}/items/{item}',       [OrderItemsController::class, 'destroy']);
        Route::patch('/orders/{order}/items/{item}/status', [OrderItemsController::class, 'updateStatus']);
        Route::patch('/orders/{order}/items/status/bulk',   [OrderItemsController::class, 'bulkUpdateStatus']);

        // SQL (solo admin — cuidado en producción)
        Route::post('/execute-sql', [SqlController::class, 'execute']);
    });
});