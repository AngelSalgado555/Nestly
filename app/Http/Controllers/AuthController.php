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

        $validator = Validator::make($request->all(), [
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email," . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json(["errors" => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $user->name = $data["name"];
        $user->email = $data["email"];
        $user->save();

        return response()->json(["success" => true, "user" => $user]);
    }
}
