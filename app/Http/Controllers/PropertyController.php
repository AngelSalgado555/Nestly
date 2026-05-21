<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
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
        // --- DEBUG TEMPORAL ---
        Log::info(
            "[store] has(images): " .
                ($request->has("images") ? "true" : "false"),
        );
        Log::info(
            "[store] hasFile(images): " .
                ($request->hasFile("images") ? "true" : "false"),
        );
        Log::info(
            "[store] gettype(file(images)): " .
                gettype($request->file("images")),
        );
        Log::info(
            "[store] all keys: " . implode(", ", array_keys($request->all())),
        );
        // --- FIN DEBUG ---

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

            // imágenes (aceptar array images[] incluso cuando hasFile() es falso)
            Log::info(
                "[store] entering images block, has: " .
                    ($request->has("images") ? "true" : "false"),
            );
            if ($request->has("images")) {
                $files = $request->file("images", []);
                if (!is_array($files)){
                    $files = $files ? [$files] : [];
                }

                Log::info("[store] files normalized to array. Count: " . count($files));
                // Log::info(
                //     "[store] files type: " .
                //         gettype($files) .
                //         ", count: " .
                //         (is_array($files) ? count($files) : "N/A"),
                // );
                if (count($files) > 0) {
                    $startOrder = (int) $property->images()->count();
                    $files = array_slice($files, 0, 10);
                    Log::info(
                        "[store] entering foreach, count: " . count($files),
                    );
                    foreach ($files as $i => $file) {
                        Log::info(
                            "[store] file[" .
                                $i .
                                "] type: " .
                                gettype($file) .
                                ", valid: " .
                                ($file && $file->isValid() ? "true" : "false"),
                        );
                        if ($file && $file->isValid()) {
                            $path = $file->store(
                                "properties/{$property->id}",
                                "public",
                            );
                            Log::info(
                                "[store] saved path: " . ($path ?: "FALSE"),
                            );
                            if ($path !== false) {
                                $property->images()->create([
                                    "path" => $path,
                                    "sort_order" => $startOrder + $i,
                                    "is_primary" =>
                                        $startOrder === 0 && $i === 0
                                            ? true
                                            : false,
                                ]);
                            }
                        }
                    }
                    $property->load("images", "primaryImage");
                } else {
                    Log::info("[store] files not array or empty");
                }
            } else {
                Log::info("[store] request->has(images) is FALSE");
            }

            return response()->json(
                [
                    "success" => true,
                    "property" => new PropertyResource($property),
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
        $userId = (int) Auth::id();
        if (!$userId || (int) $property->user_id !== $userId) {
            return response()->json(["message" => "No autorizado"], 403);
        }

        // --- DEBUG TEMPORAL ---
        Log::info(
            "[update] has(images): " .
                ($request->has("images") ? "true" : "false"),
        );
        Log::info(
            "[update] hasFile(images): " .
                ($request->hasFile("images") ? "true" : "false"),
        );
        Log::info(
            "[update] gettype(file(images)): " .
                gettype($request->file("images")),
        );
        Log::info(
            "[update] all keys: " . implode(", ", array_keys($request->all())),
        );
        // --- FIN DEBUG ---

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
            // el contenedor debe ser array para que Laravel valide files[] correctamente
            "images" => "nullable|array",
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

            // handle any new images appended (robust)
            Log::info(
                "[update] entering images block, has: " .
                    ($request->has("images") ? "true" : "false"),
            );
            $files = $request->file("images", []);
            Log::info(
                "[update] files type: " .
                    gettype($files) .
                    ", count: " .
                    (is_array($files) ? count($files) : "N/A"),
            );
            if (is_array($files) && count($files) > 0) {
                Log::info("[update] entering foreach, count: " . count($files));
                $startOrder = (int) $property->images()->count();
                $files = array_slice($files, 0, 10);
                foreach ($files as $i => $file) {
                    Log::info(
                        "[update] file[" .
                            $i .
                            "] type: " .
                            gettype($file) .
                            ", valid: " .
                            ($file && $file->isValid() ? "true" : "false"),
                    );
                    if ($file && $file->isValid()) {
                        $path = $file->store(
                            "properties/{$property->id}",
                            "public",
                        );
                        Log::info("[update] saved path: " . ($path ?: "FALSE"));
                        if ($path !== false) {
                            $property->images()->create([
                                "path" => $path,
                                "sort_order" => $startOrder + $i,
                                "is_primary" =>
                                    $startOrder === 0 && $i === 0
                                        ? true
                                        : false,
                            ]);
                        }
                    }
                }
            }

            $property->load("images", "primaryImage");

            return response()->json([
                "success" => true,
                "property" => new PropertyResource($property),
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "error" => $e->getMessage(),
                ],
                500,
            );
        }
    }
}
