<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Resend\Laravel\Facades\Resend;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'address' => 'required|string',
            'username' => 'required|string'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'username'=> $request->username,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        
      Resend::emails()->send([
            'from' => 'Acme <onboarding@resend.dev>',
            'to' => [$user->email],
            'subject' => 'Bienvenido a SerralleriaSoliaria',
            'html' => '<div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:40px;">
                <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    
                    <div style="background:#1f2937; color:white; padding:20px; text-align:center;">
                        <h1 style="margin:0; font-size:22px;">Serrallería Solidaria</h1>
                    </div>

                    <div style="padding:30px;">
                        <h2 style="color:#111; margin-bottom:10px;">Bienvenido, '.$user->name.'</h2>
                        
                        <p style="color:#555; font-size:15px; line-height:1.6;">
                            Gracias por registrarte en nuestra plataforma.
                        </p>

                        <p style="color:#555; font-size:15px; line-height:1.6;">
                            A partir de ahora puedes acceder a nuestros servicios y gestionar tus solicitudes de forma rápida y segura.
                        </p>

                        <div style="text-align:center; margin:30px 0;">
                            <a href="http://localhost:5173" 
                            style="display:inline-block; padding:12px 24px; background:#2563eb; color:white; text-decoration:none; border-radius:5px; font-size:14px;">
                                Acceder a la plataforma
                            </a>
                        </div>

                        <p style="font-size:13px; color:#888;">
                            Si no has creado esta cuenta, puedes ignorar este mensaje.
                        </p>
                    </div>

                    <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#999;">
                        © '.date('Y').' Serrallería Solidaria. Todos los derechos reservados.
                    </div>

                </div>
            </div>',
        ]);

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {

            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }

    
}
