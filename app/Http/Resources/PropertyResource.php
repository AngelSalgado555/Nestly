<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            "id" => $this->id,
            "title" => $this->title,
            "status" => $this->status ?? "available",
            "location" => $this->location,
            "price_eur" => $this->price_cents ? $this->price_cents / 100 : null,
            "rooms" => $this->rooms,
            "bathrooms" => $this->bathrooms,
            "area" => $this->area,
            "description" => $this->description,
            // Imágenes: array de objetos { id, url, is_primary, sort_order }
            "images" => $this->whenLoaded("images", function () {
                return $this->images
                    ->map(function ($img) {
                        return [
                            "id" => $img->id,
                            "url" => Storage::disk("public")->url($img->path),
                            "is_primary" => (bool) $img->is_primary,
                            "sort_order" => $img->sort_order,
                        ];
                    })
                    ->values();
            }),
            // URL de la imagen primaria (o null)
            "primary_image" => $this->whenLoaded("primaryImage", function () {
                return $this->primaryImage
                    ? Storage::disk("public")->url($this->primaryImage->path)
                    : null;
            }),
            "owner" => $this->whenLoaded("user", function () {
                return [
                    "id" => $this->user->id ?? null,
                    "name" => $this->user->name ?? null,
                ];
            }),
            "created_at" => $this->created_at
                ? $this->created_at->toDateTimeString()
                : null,
        ];
    }
}
