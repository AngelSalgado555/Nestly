<?php

use Illuminate\Support\Facades\Route;

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
