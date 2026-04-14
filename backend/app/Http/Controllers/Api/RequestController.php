<?php

namespace App\Http\Controllers\Api;

use App\Models\RequestModel;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class RequestController extends Controller
{
    // =========================
    // LISTAR
    // =========================
    public function index()
    {
        return RequestModel::orderBy('created_at', 'desc')->get();
    }

    // =========================
    // CREAR SOLICITUD
    // =========================
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string', // 👈 NUEVO (OBLIGATORIO)
            'description' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('requests', 'public');
            $data['image'] = $path;
        }

        $data['status'] = 'new';

        $requestCreated = RequestModel::create($data);

        return response()->json($requestCreated);
    }

    // =========================
    // UPDATE STATUS + NOTES (JUNTOS)
    // =========================
    public function updateStatus(Request $request, $id)
    {
        $req = RequestModel::findOrFail($id);

        $request->validate([
            'status' => 'required|in:new,contacted,quote_sent,approved,in_progress,done,rejected',
            'notes' => 'nullable|string'
        ]);

        $req->status = $request->status;

        // 👇 NOTA ADMIN (SE GUARDA AQUÍ MISMO)
        if ($request->has('notes')) {
            $req->notes = $request->notes;
        }

        $req->save();

        return response()->json([
            'message' => 'Request updated successfully',
            'data' => $req
        ]);
    }

    // =========================
    // DELETE (SOLO DONE O REJECTED)
    // =========================
    public function destroy($id)
    {
        $req = RequestModel::findOrFail($id);

        if (!in_array($req->status, ['done', 'rejected'])) {
            return response()->json([
                'message' => 'Solo se pueden eliminar solicitudes finalizadas o rechazadas'
            ], 403);
        }

        $req->delete();

        return response()->json([
            'message' => 'Request deleted successfully'
        ]);
    }
}