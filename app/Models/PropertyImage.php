<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PropertyImage extends Model
{
    protected $fillable = ['property_id', 'path', 'sort_order', 'is_primary'];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    // Devuelve URL pública en disco 'public'
    public function getUrlAttribute()
    {
        return Storage::disk('public')->url($this->path);
    }
}
