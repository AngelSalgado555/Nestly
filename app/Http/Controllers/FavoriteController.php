<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Favorite;
use App\Models\Property;
use App\Http\Resources\PropertyResource;

class FavoriteController extends Controller
{
    /**
     * Toggle a property as favorite for the authenticated user.
     * Returns { is_favorite: bool, property_id: int }
     */
    public function toggle(Property $property)
    {
        $userId = Auth::id();

        $existing = Favorite::where('user_id', $userId)
            ->where('property_id', $property->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'is_favorite' => false,
                'property_id' => $property->id,
            ]);
        }

        Favorite::create([
            'user_id'     => $userId,
            'property_id' => $property->id,
        ]);

        return response()->json([
            'is_favorite' => true,
            'property_id' => $property->id,
        ]);
    }

    /**
     * Return the paginated list of properties favorited by the authenticated user.
     */
    public function index()
    {
        $properties = Property::whereHas('favorites', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->with(['images', 'primaryImage', 'user'])
            ->paginate(12);

        return PropertyResource::collection($properties);
    }
}
