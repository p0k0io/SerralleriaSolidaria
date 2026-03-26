<?php
namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Devuelve los datos del dashboard en JSON
     */
    public function index(): JsonResponse
    {
        try {
            // Obtener productos con bajo stock
            $lowStockProducts = Product::where('stock', '<', 20)
                ->orderByDesc('id') // usar id como fallback si no hay created_at
                ->take(6)
                ->get(['id', 'name', 'sku', 'stock']);

            // Obtener productos con mayor stock
            $topProducts = Product::orderByDesc('stock')
                ->take(4)
                ->get(['id', 'name', 'sku', 'stock']);

            // Placeholder para pedidos urgentes
            $urgentOrders = [];

            return response()->json([
                'urgent_orders' => $urgentOrders,
                'low_stock' => $lowStockProducts,
                'top_products' => $topProducts,
            ]);
        } catch (\Throwable $e) {
            // Loguear el error para depuración
            Log::error('DashboardController index error: ' . $e->getMessage());

            return response()->json([
                'error' => 'Ocurrió un error al cargar el dashboard'
            ], 500);
        }
    }
}