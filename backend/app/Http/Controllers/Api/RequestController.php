<?php
namespace App\Http\Controllers;

use App\Models\Request as RequestModel;
use Illuminate\Http\Request;

class RequestController extends Controller
{
    // LISTAR TODAS LAS SOLICITUDES
    public function index()
    {
        return RequestModel::orderBy('created_at', 'desc')->get();
    }

    // CREAR SOLICITUD (CON IMAGEN)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'email' => 'required',
            'description' => 'required',
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

    // CAMBIAR ESTADO (DRAG & DROP)
    public function updateStatus(Request $request, $id)
    {
        $req = RequestModel::findOrFail($id);

        $request->validate([
            'status' => 'required|in:new,contacted,quote_sent,approved,in_progress,done,rejected'
        ]);

        $req->status = $request->status;
        $req->save();

        return response()->json(['message' => 'status updated']);
    }

    // NOTAS INTERNAS
    public function updateNotes(Request $request, $id)
    {
        $req = RequestModel::findOrFail($id);

        $req->notes = $request->notes;
        $req->save();

        return response()->json(['message' => 'notes updated']);
    }
}