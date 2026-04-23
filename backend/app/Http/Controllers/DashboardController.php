<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function monthlySales()
    {
        $sales = Order::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(total_amount) as total')
        )
        ->where('status', 'completed')
        ->groupBy('year', 'month')
        ->orderBy('year', 'desc')
        ->orderBy('month', 'desc')
        ->get()
        ->map(function ($item) {
            $monthNames = [
                1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr',
                5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Ago',
                9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic'
            ];
            return [
                'month' => $monthNames[$item->month],
                'total' => (float) $item->total
            ];
        });

        return response()->json($sales);
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
}