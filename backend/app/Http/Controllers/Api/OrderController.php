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

        return response()->json($orders->map(function($order) {
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
                'items' => $order->items->map(function($item) {
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
                'services' => $order->services->map(function($service) {
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
     * GET /api/orders/{id}
     * Obtiene una orden específica con todos sus detalles
     */
    public function show($id)
    {
        $order = Order::with([
            'items.variant.product',
            'items.pack',
            'services.service',
            'payment'
        ])->findOrFail($id);

        return response()->json([
            'id' => $order->id,
            'order_number' => 'PED-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
            'client' => $order->full_name ?? 'Cliente',
            'email' => $order->email,
            'phone' => $order->phone,
            'address' => $order->address,
            'postal_code' => $order->postal_code,
            'city' => $order->city,
            'country' => $order->country,
            'total_amount' => $order->total_amount,
            'status' => $order->status,
            'items' => $order->items->map(function($item) {
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
            'services' => $order->services->map(function($service) {
                return [
                    'id' => $service->id,
                    'service_name' => $service->service->name ?? 'Servicio',
                    'price' => $service->price,
                ];
            })->all(),
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ]);
    }
}
