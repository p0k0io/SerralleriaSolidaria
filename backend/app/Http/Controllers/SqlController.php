<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SqlController extends Controller
{
    public function execute(Request $request)
    {
        $request->validate([
            'sql' => 'required|string',
        ]);

        $sql = $request->sql;

        try {
            // Para consultas SELECT
            if (stripos($sql, 'select') === 0) {
                $result = DB::select($sql);
                return response()->json($result);
            } else {
                // Para otras consultas (INSERT, UPDATE, DELETE)
                $affected = DB::statement($sql);
                return response()->json(['affected_rows' => $affected]);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}