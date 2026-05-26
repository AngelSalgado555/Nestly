// resources/js/Components/ModeViews/FilterPanel.jsx
import React from "react";

export default function FilterPanel({ filters, setFilters, onApply }) {
    
    // Evitamos que la página se recargue por defecto al enviar el formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onApply) onApply();
    };

    return (
        <aside className="fixed left-6 top-24 w-72 bg-white rounded-xl shadow-xl p-5 z-40 border border-slate-100">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="text-xl">🔍</span>
                <h2 className="text-lg font-medium text-slate-800">Filtrar Pisos</h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Filtro 1: Texto / Palabra clave */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Ubicación o palabra clave
                    </label>
                    <input
                        type="text"
                        placeholder="Introduce la ubicación que deseas..."
                        value={filters?.busqueda || ""}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-700"
                        onChange={(e) =>
                            setFilters({ ...filters, busqueda: e.target.value })
                        }
                    />
                </div>

                {/* Filtro 2: Precio Máximo */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Precio Máximo (€)
                    </label>
                    <input
                        type="number"
                        placeholder="Cualquier precio"
                        value={filters?.precioMax || ""}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-700"
                        onChange={(e) =>
                            setFilters({ ...filters, precioMax: e.target.value })
                        }
                    />
                </div>

                {/* Filtro 3: Habitaciones */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Número de Habitaciones
                    </label>
                    <input
                        type="number"
                        placeholder="Ingresa el número de habs..."
                        value={filters?.habitaciones || ""}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-700"
                        onChange={(e) =>
                            setFilters({ ...filters, habitaciones: e.target.value })
                        }
                    />
                </div>
            </form>
        </aside>
    );
}