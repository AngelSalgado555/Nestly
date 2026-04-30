<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Property;

class PropertyController extends Controller
{
    // Devuelve todos los inmuebles (para compradores)
    public function index()
    {
        $properties = Property::with('user')->get();
        return response()->json($properties);
    }

    // Guarda un nuevo inmueble (para vendedores)
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_cents' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:255',
            'rooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'area' => 'nullable|integer|min:0',
        ]);

        $property = Property::create($data);
        return response()->json($property, 201);
    }

    // Devuelve las propiedades subidas por un usuario
    public function userProperties($userId)
    {
        $properties = Property::where('user_id', $userId)->get();
        return response()->json($properties);
    }
}
