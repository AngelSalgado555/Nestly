<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\AuthController;

Route::get("/properties", [PropertyController::class, "index"]);
Route::post("/properties", [PropertyController::class, "store"]);
Route::get("/users/{userId}/properties", [
    PropertyController::class,
    "userProperties",
]);

// Auth routes that need session (use web middleware so Auth::attempt uses sessions)
Route::middleware("web")->group(function () {
    Route::post("/register", [AuthController::class, "register"]);
    Route::post("/login", [AuthController::class, "login"]);
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::get("/user", [AuthController::class, "user"]);
});
