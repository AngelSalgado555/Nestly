<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\PropertyResource;

class PropertyController extends Controller
{
    // Devuelve todos los inmuebles (para compradores/publico)
    public function index(Request $request)
    {
        $query = Property::with(["user", "images", "primaryImage"]);

        if ($request->filled("location")) {
            $query->where(
                "location",
                "like",
                "%" . $request->input("location") . "%",
            );
        }
        if ($request->filled("min_price")) {
            $query->where(
                "price_cents",
                ">=",
                (int) $request->input("min_price") * 100,
            );
        }
        if ($request->filled("max_price")) {
            $query->where(
                "price_cents",
                "<=",
                (int) $request->input("max_price") * 100,
            );
        }

        $properties = $query->orderByDesc("id")->paginate(12);

        return PropertyResource::collection($properties);
    }

    public function store(Request $request)
    {
        // Validación: adaptar a los campos que el frontend puede enviar (muchos son opcionales)
        $validator = Validator::make($request->all(), [
            "title" => "required|string|max:255",
            "description" => "nullable|string",
            "location" => "nullable|string",
            "rooms" => "nullable|integer",
            "bathrooms" => "nullable|integer",
            "area" => "nullable|integer",
            "price_cents" => "nullable|integer",
            "price" => "nullable|numeric",
            // imágenes opcionales: cada archivo debe ser imagen y <=5MB
            "images.*" => "nullable|image|mimes:jpeg,png,jpg,webp|max:5120",
        ]);

        if ($validator->fails()) {
            return response()->json(
                [
                    "success" => false,
                    "errors" => $validator->errors(),
                ],
                422,
            );
        }

        $validated = $validator->validated();

        // Manejo seguro del precio (safety net)
        $priceCents = null;
        if (
            $request->has("price_cents") &&
            $request->input("price_cents") !== null
        ) {
            $priceCents = (int) $request->input("price_cents");
        } elseif ($request->has("price") && $request->input("price") !== null) {
            $priceCents = (int) round(floatval($request->input("price")) * 100);
        }

        try {
            $property = Property::create([
                "user_id" => Auth::id(),
                "title" => $validated["title"],
                "description" => $validated["description"] ?? null,
                "location" => $validated["location"] ?? null,
                "price_cents" => $priceCents,
                "rooms" => isset($validated["rooms"])
                    ? (int) $validated["rooms"]
                    : null,
                "bathrooms" => isset($validated["bathrooms"])
                    ? (int) $validated["bathrooms"]
                    : null,
                "area" => isset($validated["area"])
                    ? (int) $validated["area"]
                    : null,
            ]);

            // Manejo básico de imágenes: almacenar en disco 'public' y crear registros
            if ($request->hasFile("images")) {
                $files = $request->file("images");
                // limitar a 10 por seguridad
                $files = array_slice($files, 0, 10);
                foreach ($files as $i => $file) {
                    $path = $file->store(
                        "properties/{$property->id}",
                        "public",
                    );
                    $property->images()->create([
                        "path" => $path,
                        "sort_order" => $i,
                        "is_primary" => $i === 0,
                    ]);
                }
                // recargar relación
                $property->load("images", "primaryImage");
            }

            return response()->json(
                [
                    "success" => true,
                    "property" => $property,
                ],
                201,
            );
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "error" => $e->getMessage(),
                    "trace" => $e->getTraceAsString(),
                ],
                500,
            );
        }
    }

    // Devuelve las propiedades subidas por un usuario
    public function userProperties($userId)
    {
        $properties = Property::where("user_id", $userId)->get();
        return response()->json($properties);
    }
}
