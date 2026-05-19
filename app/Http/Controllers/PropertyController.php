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
        $validator = Validator::make($request->all(), [
            "title" => "required|string|max:255",
            "description" => "nullable|string",
            "location" => "nullable|string",
            "rooms" => "nullable|integer",
            "bathrooms" => "nullable|integer",
            "area" => "nullable|integer",
            "price_cents" => "nullable|integer",
            "price" => "nullable|numeric",
            // estado de la propiedad (opcional)
            "status" => "nullable|in:available,sold,rented,unavailable",
            // imágenes opcionales
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

        // precio en centimos
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
                "status" => $validated["status"] ?? "available",
            ]);

            // imágenes
            if ($request->hasFile("images")) {
                $files = $request->file("images");
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
        $properties = Property::with(["user", "images", "primaryImage"])
            ->where("user_id", $userId)
            ->get();

        return PropertyResource::collection($properties);
    }

    // Actualiza una propiedad (solo propietario)
    public function update(Request $request, Property $property)
    {
        $userId = Auth::id();
        if (!$userId || $property->user_id !== $userId) {
            return response()->json(["message" => "No autorizado"], 403);
        }

        $validator = Validator::make($request->all(), [
            "title" => "nullable|string|max:255",
            "description" => "nullable|string",
            "location" => "nullable|string",
            "rooms" => "nullable|integer",
            "bathrooms" => "nullable|integer",
            "area" => "nullable|integer",
            "price_cents" => "nullable|integer",
            "price" => "nullable|numeric",
            "status" => "nullable|in:available,sold,rented,unavailable",
            "images.*" => "nullable|image|mimes:jpeg,png,jpg,webp|max:5120",
        ]);

        if ($validator->fails()) {
            return response()->json(
                ["success" => false, "errors" => $validator->errors()],
                422,
            );
        }

        $data = $validator->validated();

        // price handling
        if (isset($data["price_cents"])) {
            $property->price_cents = (int) $data["price_cents"];
        } elseif (isset($data["price"])) {
            $property->price_cents = (int) round(
                floatval($data["price"]) * 100,
            );
        }

        foreach (
            [
                "title",
                "description",
                "location",
                "rooms",
                "bathrooms",
                "area",
                "status",
            ]
            as $f
        ) {
            if (array_key_exists($f, $data)) {
                $property->{$f} = $data[$f];
            }
        }

        try {
            $property->save();

            // handle any new images appended
            if ($request->hasFile("images")) {
                $files = $request->file("images");
                $files = array_slice($files, 0, 10);
                foreach ($files as $i => $file) {
                    $path = $file->store(
                        "properties/{$property->id}",
                        "public",
                    );
                    $property->images()->create([
                        "path" => $path,
                        "sort_order" => (int) $property->images()->count() + $i,
                        "is_primary" => false,
                    ]);
                }
            }

            $property->load("images", "primaryImage");

            return response()->json([
                "success" => true,
                "property" => $property,
            ]);
        } catch (Exception $e) {
            return response()->json(
                ["success" => false, "error" => $e->getMessage()],
                500,
            );
        }
    }
}
