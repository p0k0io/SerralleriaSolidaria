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
        'message' => 'API funcionando correctamente'
    ]);
});

// Listados / búsqueda
Route::get('/products',[ProductController::class, 'index']);          // Todos (activos + inactivos), acepta ?search=&active=&stock_status=&category_id=&has_extra_keys=
Route::get('/products/featured',[ProductController::class, 'featured']);       // Solo los que tienen variantes destacadas activas
Route::get('/products/search',[ProductController::class, 'search']);         // Búsqueda rápida: ?q=&category_id=&active=&stock_status=

// Detalle
Route::get('/products/{id}',[ProductController::class, 'show']);

// Creación
Route::post('/products',[ProductController::class, 'store']);
Route::post('/products/products-with-variants',[ProductController::class, 'storeWithVariants']);


Route::get('/requests/{id}', [RequestController::class, 'show']);
Route::delete('/requests/{id}', [RequestController::class, 'destroy']);
Route::get('/requests/status/{status}', [RequestController::class, 'filterByStatus']);
Route::get('/requests/date-range', [RequestController::class, 'filterByDateRange']);
Route::get('/requests/search', [RequestController::class, 'searchByCustomerName']);
Route::get('/requests/summary', [RequestController::class, 'summaryByStatus']);
Route::get('/requests/{id}/pdf', [RequestController::class, 'generatePdf']);
Route::get('/requests/{id}/email', [RequestController::class, 'sendEmailNotification']);
// Actualización
Route::put('/products/{id}',[ProductController::class, 'update']);

// Borrado
Route::delete('/products/{id}',[ProductController::class, 'destroy']);

// Activar / Desactivar producto
Route::post('/products/enable/{id}',[ProductController::class, 'enable']);
Route::post('/products/disable/{id}',[ProductController::class, 'disable']);

// Añadir variante a un producto existente
Route::post('/products/{id}/variants',[ProductController::class, 'addVariant']);



/*
|--------------------------------------------------------------------------
| VARIANTS
|--------------------------------------------------------------------------*/

Route::prefix('variants')->group(function () {

    // Listados / búsqueda
    // NOTA: rutas estáticas primero
    Route::get('/active',          [VariantController::class, 'getActiveVariants']); // ?search=&stock_status=&featured=
    Route::get('/search',          [VariantController::class, 'search']);             // ?q=&active=&featured=&stock_status=&product_id=

    // CRUD
    Route::get('/',                [VariantController::class, 'index']);              // ?search=&active=&featured=&stock_status=&product_id=
    Route::post('/',               [VariantController::class, 'store']);
    Route::get('/{id}',            [VariantController::class, 'show']);
    Route::put('/{id}',            [VariantController::class, 'update']);
    Route::delete('/{id}',         [VariantController::class, 'destroy']);

    // Activar / Desactivar
    Route::post('/enable/{id}',    [VariantController::class, 'enable']);
    Route::post('/disable/{id}',   [VariantController::class, 'disable']);

    // Toggles
    Route::post('/{id}/toggle',          [VariantController::class, 'toggleActive']);
    Route::post('/{id}/toggle-featured', [VariantController::class, 'toggleFeatured']);

    // Stock
    Route::patch('/{id}/stock',    [VariantController::class, 'updateStock']);        // Body: { stock_status: "available"|"out_of_stock"|"next_batch" }
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
});