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
            "location" => $this->location,
            "price_eur" => $this->price_cents ? $this->price_cents / 100 : null,
            "rooms" => $this->rooms,
            "bathrooms" => $this->bathrooms,
            "area" => $this->area,
            "description" => $this->description,
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
