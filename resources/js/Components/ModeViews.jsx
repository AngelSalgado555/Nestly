// resources/js/Components/ModeViews.jsx
import React from "react";
import Navbar from "./Navbar";
import fondo from "../../images/Fondo.png";

// Importaciones directas de los archivos reales que SÍ existen en tu carpeta ModeViews
import FilterPanel from "./ModeViews/FilterPanel";
import BuyerView from "./ModeViews/BuyerView";
import SellerView from "./ModeViews/SellerView";
import FavoritesView from "./ModeViews/FavoritesView";
import MyPropertiesView from "./ModeViews/MyPropertiesView";

function FavoritesViewPlaceholder() {
    return (
        <div className="p-6 text-center text-slate-500">
            <h2 className="text-xl font-bold mb-2 text-slate-700">Mis Favoritos</h2>
            <p>Aquí se mostrarán las propiedades que guardes en el buscador.</p>
        </div>
    );
}

export default function ModeApp({ onNavigate }) {
    function readStoredMode() {
        try {
            const v = localStorage.getItem("nestly_mode");
            return v ? v : "comprador";
        } catch (e) {
            return "comprador";
        }
    }

    const [modo, setModoRaw] = React.useState(readStoredMode());
    const [filters, setFilters] = React.useState({
        busqueda: "",
        precioMax: "",
        habitaciones: ""
    });

    const setModo = (v) => {
        setModoRaw(v);
        try {
            localStorage.setItem("nestly_mode", v);
        } catch (e) {
            // ignore
        }
    };

    return (
        <div className="min-h-screen w-full relative flex items-start justify-center py-12 isolation-auto">
            {/* CAPA DE FONDO INMUTABLE */}
            <div
                className="fixed inset-0 w-full h-full z-0 pointer-events-none"
                style={{
                    backgroundImage: `url(${fondo})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Sutil superposición oscura */}
            <div className="fixed inset-0 bg-slate-900/10 z-0 pointer-events-none " />

            {/* Contenedor adaptativo */}
            <div className="w-full max-w-6xl px-4 pt-12 z-10 ml-auto pr-6">
                <Navbar
                    modo={modo}
                    setModo={setModo}
                    onNavigate={onNavigate}
                />

                {modo === "comprador" && (
                    <FilterPanel 
                        filters={filters} 
                        setFilters={setFilters} 
                    />
                )}

                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/40 p-6">
                    <div className="mt-6">
                        {/* Enrutador limpio */}
                        {modo === "comprador" ? (
                            <BuyerView filters={filters} />
                        ) : modo === "vendedor" ? (
                            <SellerView />
                        ) : modo === "favoritos" ? (
                            <FavoritesView />
                        ) : (
                            <MyPropertiesView />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}