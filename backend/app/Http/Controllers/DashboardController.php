<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function monthlySales()
    {
        $currentYear = date('Y');
        
        $sales = Order::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(total_amount) as total')
        )
        ->where('status', 'completed')
        ->whereYear('created_at', $currentYear)
        ->groupBy('month')
        ->orderBy('month', 'asc')
        ->get()
        ->map(function ($item) {
            $monthNames = [
                1 => 'Gen', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr',
                5 => 'Mai', 6 => 'Jun', 7 => 'Jul', 8 => 'Ago',
                9 => 'Set', 10 => 'Oct', 11 => 'Nov', 12 => 'Des'
            ];
            return [
                'month' => $monthNames[$item->month],
                'total' => (float) $item->total
            ];
        });

        // Rellenar los 12 meses (los sin ventas = 0)
        $monthNames = [
            1 => 'Gen', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr',
            5 => 'Mai', 6 => 'Jun', 7 => 'Jul', 8 => 'Ago',
            9 => 'Set', 10 => 'Oct', 11 => 'Nov', 12 => 'Des'
        ];
        
        $fullData = [];
        for ($m = 1; $m <= 12; $m++) {
            $found = $sales->firstWhere('month', $monthNames[$m]);
            $fullData[] = $found ?? ['month' => $monthNames[$m], 'total' => 0];
        }

        return response()->json($fullData);
    }

    public function dailySales(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $month = $request->get('month', date('m'));

        $sales = Order::select(
            DB::raw('DAY(created_at) as day'),
            DB::raw('SUM(total_amount) as total')
        )
        ->where('status', 'completed')
        ->whereYear('created_at', $year)
        ->whereMonth('created_at', $month)
        ->groupBy('day')
        ->orderBy('day')
        ->get()
        ->map(function ($item) {
            return [
                'day' => (int) $item->day,
                'total' => (float) $item->total
            ];
        });

        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $fullData = [];
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $found = $sales->firstWhere('day', $day);
            $fullData[] = $found ? $found : ['day' => $day, 'total' => 0];
        }

        return response()->json($fullData);
    }

    public function hourlySales()
    {
        $sales = Order::select(
            DB::raw('HOUR(created_at) as hour'),
            DB::raw('SUM(total_amount) as total'),
            DB::raw('COUNT(*) as orders')
        )
        ->where('status', 'completed')
        ->whereDate('created_at', today())
        ->groupBy('hour')
        ->orderBy('hour')
        ->get()
        ->map(fn($item) => [
            'hour'   => (int) $item->hour,
            'total'  => (float) $item->total,
            'orders' => (int) $item->orders,
        ]);

        // Rellenar las 24 horas
        $fullData = [];
        for ($h = 0; $h < 24; $h++) {
            $found = $sales->firstWhere('hour', $h);
            $fullData[] = $found ?? ['hour' => $h, 'total' => 0, 'orders' => 0];
        }
        return response()->json($fullData);
    }
}