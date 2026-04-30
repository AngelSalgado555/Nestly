import React from "react";

export default function Navbar({ modo, setModo }) {
    console.log("Navbar rendered, modo=", modo);
    return (
        <nav className="w-full bg-white/90 backdrop-blur-sm shadow p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
            <div className="font-bold text-lg">Nestly</div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setModo("comprador")}
                    className={`px-4 py-2 rounded ${modo === "comprador" ? "bg-emerald-600 text-white" : "bg-gray-100"}`}
                >
                    Comprador
                </button>
                <button
                    onClick={() => setModo("vendedor")}
                    className={`px-4 py-2 rounded ${modo === "vendedor" ? "bg-emerald-600 text-white" : "bg-gray-100"}`}
                >
                    Vendedor
                </button>
            </div>
        </nav>
    );
}
