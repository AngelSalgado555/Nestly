// resources/js/Components/ModeViews/PropertyFormModal.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import PropertyForm from "../PropertyForm";

export default function PropertyFormModal({ property, onClose, onUpdated }) {

    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    // Bloquear scroll del body mientras el modal está abierto
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev || "unset";
        };
    }, []);

    // Callback que recibe PropertyForm al guardar con éxito
    function handlePublished(data) {
        const updated = data?.property ?? data;
        if (onUpdated) onUpdated(updated);
        onClose();
    }

    return createPortal(
        <>
            {/* ── Capa visual: fondo oscuro + blur ── */}
            <div
                className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* ── Capa de layout: centrado + scroll ── */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Cabecera ── */}
                    <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">✏️</span>
                            <h2 className="text-lg font-bold text-slate-800">
                                {property ? "Editar propiedad" : "Nueva propiedad"}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-lg font-bold"
                            title="Cerrar"
                            aria-label="Cerrar formulario"
                        >
                            ✕
                        </button>
                    </div>

                    {/* ── Cuerpo scrollable con el formulario ── */}
                    <div className="overflow-y-auto flex-grow p-6">
                        <PropertyForm
                            property={property}
                            onPublished={handlePublished}
                        />
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
