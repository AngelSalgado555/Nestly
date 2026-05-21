<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\FavoriteController;

Route::get("/", function () {
    return view("welcome");
});

// Example routes for seller and buyer dashboards (no middleware applied)
Route::get("/seller/dashboard", function () {
    return view("seller.dashboard");
})->name("seller.dashboard");
Route::get("/buyer/dashboard", function () {
    return view("buyer.dashboard");
})->name("buyer.dashboard");

// Generic dashboard
Route::get("/dashboard", function () {
    return view("dashboard");
})->name("dashboard");

// Home route for authenticated users (SPA entrypoint)
Route::get("/home", function () {
    return view("home");
})->name("home");

// Auth routes (moved from api.php to web.php for session-based auth)
Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);
Route::post("/logout", [AuthController::class, "logout"]);
Route::get("/user", [AuthController::class, "user"]);
Route::post("/user/update", [AuthController::class, "update"]);

// Public property listing (anyone can see listings)
Route::get("/properties", [PropertyController::class, "index"]);

// Property routes protected by auth (creating and user-specific listings)
Route::middleware(["auth"])->group(function () {
    Route::post("/properties", [PropertyController::class, "store"]);
    Route::put("/properties/{property}", [PropertyController::class, "update"]);
    Route::get("/users/{userId}/properties", [
        PropertyController::class,
        "userProperties",
    ]);
    Route::post("/favorites/{property}", [FavoriteController::class, "toggle"]);
    Route::get("/favorites", [FavoriteController::class, "index"]);
});
