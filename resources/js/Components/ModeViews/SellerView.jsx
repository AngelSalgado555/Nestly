// resources/js/Components/ModeViews/SellerView.jsx
import React from "react";
// Corregimos la ruta subiendo un nivel con '../' para encontrar el formulario en la raíz de Components
import PropertyForm from "../PropertyForm";

export default function SellerView() {
    return (
        <div className="max-w-4xl mx-auto py-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    Publicar un nuevo piso
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Completa el siguiente formulario con los datos, características e imágenes de tu propiedad para ponerla a la venta o en alquiler.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-2">
                <PropertyForm />
            </div>
        </div>
    );
}