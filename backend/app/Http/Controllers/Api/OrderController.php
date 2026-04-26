<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    /**
     * GET /api/orders/prepared
     * Obtiene las órdenes preparadas para enviar con todos sus items y servicios
     */
    public function getPreparedOrders()
    {
        $orders = Order::where('status', 'listo_envio')
            ->with([
                'items.variant.product',
                'items.pack',
                'services.service'
            ])
            ->get();

        return response()->json($orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => 'PED-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                'client' => $order->full_name ?? 'Cliente',
                'email' => $order->email,
                'phone' => $order->phone,
                'city' => $order->city,
                'total_amount' => $order->total_amount,
                'items_count' => $order->items->count(),
                'services_count' => $order->services->count(),
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'variant' => $item->variant ? [
                            'id' => $item->variant->id,
                            'sku' => $item->variant->sku,
                            'product_name' => $item->variant->product->name ?? 'Producto',
                            'image' => $item->variant->image,
                        ] : null,
                        'pack' => $item->pack ? [
                            'id' => $item->pack->id,
                            'name' => $item->pack->name,
                        ] : null,
                    ];
                })->all(),
                'services' => $order->services->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'service_name' => $service->service->name ?? 'Servicio',
                        'price' => $service->price,
                    ];
                })->all(),
                'created_at' => $order->created_at,
            ];
        }));
    }

    /**
     * LISTADO PARA ADMIN (KANBAN)
     */
    public function index()
    {
        try {
            $orders = Order::with(['user', 'items', 'payment'])->get();

            return response()->json($orders);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ], 500);
        }
    }

    /**
     * DETALLE DE UN PEDIDO
     */
    public function show($id)
    {
        try {
            $order = Order::with([
                'user',
                'items.variant.product',
                'items.pack',
                'services.service',
                'payment',
            ])->findOrFail($id);

            return response()->json($this->formatOrder($order));

        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Pedido no encontrado',
                'debug' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * ACTUALIZAR ESTADO (KANBAN DRAG & DROP)
     */
    public function update(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);

            $validated = $request->validate([
                'status' => 'required|in:nuevo,en_preparacion,empaquetando,listo_envio,enviado,completado,cancelado',
            ]);

            $order->update([
                'status' => $validated['status'],
            ]);

            return response()->json([
                'message' => 'Pedido actualizado correctamente',
                'order' => $this->formatOrder(
                    $order->fresh()->load(['user', 'items.variant.product', 'items.pack', 'services.service', 'payment'])
                ),
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Error actualizando pedido',
                'debug' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ELIMINAR PEDIDO
     */
    public function destroy($id)
    {
        try {
            Order::findOrFail($id)->delete();

            return response()->json([
                'message' => 'Pedido eliminado correctamente',
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Error eliminando pedido',
                'debug' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * FORMATEO SEGURO PARA FRONTEND (SIN CRASHES)
     */
    private function formatOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => 'PED-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
            'full_name' => $order->full_name ?? '',
            'email' => $order->email ?? '',
            'phone' => $order->phone ?? '',
            'address' => $order->address ?? '',
            'postal_code' => $order->postal_code ?? '',
            'city' => $order->city ?? '',
            'country' => $order->country ?? '',
            'status' => $order->status ?? 'nuevo',
            'total_amount' => (float) ($order->total_amount ?? 0),
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'user' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
            ] : null,
            'payment' => $order->payment ? [
                'provider' => $order->payment->provider ?? null,
                'payment_status' => $order->payment->payment_status ?? null,
                'transaction_id' => $order->payment->transaction_id ?? null,
            ] : null,
            'items' => $order->items ? $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity ?? 1,
                    'price' => isset($item->price) ? (float) $item->price : null,
                    'unit_price' => isset($item->unit_price) ? (float) $item->unit_price : null,
                    'status' => $item->status ?? null,
                    'variant' => $item->variant ? [
                        'id' => $item->variant->id,
                        'sku' => $item->variant->sku,
                        'product_name' => $item->variant->product->name ?? ($item->product_name ?? 'Producto'),
                        'image' => $item->variant->image,
                    ] : null,
                    'pack' => $item->pack ? [
                        'id' => $item->pack->id,
                        'name' => $item->pack->name,
                    ] : null,
                ];
            })->values()->toArray() : [],
            'services' => $order->services ? $order->services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'service_name' => $service->service->name ?? 'Servicio',
                    'price' => $service->price,
                ];
            })->values()->toArray() : [],
        ];
    }
}
