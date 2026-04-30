import React from "react";
import Navbar from "./Navbar";

export function BuyerView() {
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
                Buscador de pisos (Modo Comprador)
            </h2>
            <p>Aquí iría la interfaz para buscar y filtrar propiedades.</p>
        </div>
    );
}

export function SellerView() {
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
                Panel de gestión (Modo Vendedor)
            </h2>
            <p>
                Aquí iría el formulario para subir un piso y ver tus anuncios.
            </p>
        </div>
    );
}

export default function ModeApp() {
    console.log("ModeApp mounted");
    const [modo, setModo] = React.useState("comprador");

    return (
        <div className="min-h-screen bg-emerald-50 flex items-start justify-center py-12">
            <div className="w-full max-w-2xl px-4 pt-16">
                <div className="bg-white rounded-xl shadow p-6">
                    {/* Navbar with mode switch */}
                    <Navbar modo={modo} setModo={setModo} />

                    <div className="mt-6">
                        {modo === "comprador" ? <BuyerView /> : <SellerView />}
                    </div>
                </div>
            </div>
        </div>
    );
}
