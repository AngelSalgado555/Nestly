<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    // Permitir asignación masiva en estos campos
    protected $fillable = [
        "user_id",
        "title",
        "description",
        "location",
        "price_cents",
        "rooms",
        "bathrooms",
        "area",
    ];

    // Relación opcional con el usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación con imágenes
    public function images()
    {
        return $this->hasMany(PropertyImage::class)->orderBy("sort_order");
    }

    public function primaryImage()
    {
        return $this->hasOne(PropertyImage::class)->where("is_primary", true);
    }
}
