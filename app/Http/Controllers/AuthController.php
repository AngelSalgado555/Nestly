<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email",
            "password" => "required|string|min:6|confirmed",
        ]);

        if ($validator->fails()) {
            return response()->json(["errors" => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $user = User::create([
            "name" => $data["name"],
            "email" => $data["email"],
            "password" => Hash::make($data["password"]),
        ]);

        Auth::login($user);

        return response()->json(["success" => true, "user" => $user]);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "email" => "required|email",
            "password" => "required|string",
        ]);

        if ($validator->fails()) {
            return response()->json(["errors" => $validator->errors()], 422);
        }

        $credentials = $request->only("email", "password");

        if (!Auth::attempt($credentials)) {
            return response()->json(
                ["message" => "Credenciales inválidas"],
                401,
            );
        }

        $user = Auth::user();
        return response()->json(["success" => true, "user" => $user]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        // return success so frontend can clear localStorage
        return response()->json(["success" => true]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(["message" => "No autenticado"], 401);
        }

        // Reglas base: nombre y email siempre requeridos
        $rules = [
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email," . $user->id,
        ];

        // Reglas de contraseña: solo se validan si el usuario envía algún campo de contraseña
        $wantsPasswordChange =
            $request->filled("current_password") ||
            $request->filled("new_password") ||
            $request->filled("new_password_confirmation");

        if ($wantsPasswordChange) {
            $rules["current_password"] = "required|string";
            $rules["new_password"] = "required|string|min:8|confirmed";
            $rules["new_password_confirmation"] = "required|string";
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(["errors" => $validator->errors()], 422);
        }

        // Verificar que la contraseña actual es correcta
        if ($wantsPasswordChange) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(
                    [
                        "errors" => [
                            "current_password" => [
                                "La contraseña actual no es correcta.",
                            ],
                        ],
                    ],
                    422,
                );
            }
            $user->password = Hash::make($request->new_password);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json(["success" => true, "user" => $user]);
    }
}
