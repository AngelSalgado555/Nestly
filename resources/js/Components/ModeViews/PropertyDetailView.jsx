// resources/js/Components/ModeViews/PropertyDetailView.jsx
import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 🔥 Importamos el teletransporte de React

/** Devuelve true solo si la URL parece una imagen real */
function isValidImageUrl(url) {
    return (
        Boolean(url) &&
        typeof url === "string" &&
        /\.(jpe?g|png|gif|webp|bmp|svg)(\?|#|$)/i.test(url)
    );
}

const STATUS_LABEL = { available: "Disponible", sold: "Vendido", rented: "Alquilado" };
const STATUS_COLOR = {
    available: "bg-emerald-100 text-emerald-800",
    sold: "bg-red-100 text-red-800",
    rented: "bg-yellow-100 text-yellow-800",
};

export default function PropertyDetailView({ property, onClose }) {
    const allImages = useMemo(() => {
        const list = [];
        if (isValidImageUrl(property.primary_image)) list.push(property.primary_image);
        if (Array.isArray(property.images)) {
            property.images.forEach((img) => {
                const url = img?.url || img;
                if (isValidImageUrl(url) && !list.includes(url)) list.push(url);
            });
        }
        return list;
    }, [property]);

    const [selectedIdx, setSelectedIdx] = useState(0);

    // Cerrar con Escape
    useEffect(() => {
        function handleKey(e) { if (e.key === "Escape") onClose(); }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    // Bloquear scroll seguro
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = originalOverflow || "unset"; };
    }, []);

    if (!property) return null;

    const statusLabel = STATUS_LABEL[property.status] ?? "No disponible";
    const statusColor = STATUS_COLOR[property.status] ?? "bg-slate-100 text-slate-800";
    const ownerInitial = property.owner?.name ? property.owner.name.trim()[0].toUpperCase() : "?";

    // 🔥 EL TRUCO DEL PORTAL: Todo el JSX se renderiza directamente en el document.body
    return createPortal(
        <>
            {/* Fondo oscurecido con blur fijo */}
            <div
                className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Contenedor centrado absoluto */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* CABECERA */}
                    <div className="flex items-center justify-between gap-3 px-6 py-4 bg-white border-b border-slate-100 flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <h2 className="text-xl font-bold text-slate-800 truncate">{property.title}</h2>
                            {property.status && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusColor}`}>
                                    {statusLabel}
                                </span>
                            )}
                        </div>
                        <button onClick={onClose} className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-lg font-bold">
                            ✕
                        </button>
                    </div>

                    {/* CUERPO CON SCROLL */}
                    <div className="overflow-y-auto flex-grow p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* COLUMNA IZQUIERDA: Galería */}
                            <div className="lg:pr-6 lg:border-r border-slate-100">
                                <div className="relative w-full h-64 lg:h-72 rounded-xl overflow-hidden bg-slate-100 group mb-3 shadow-inner">
                                    {allImages.length > 0 ? (
                                        <>
                                            <img src={allImages[selectedIdx]} alt={property.title} className="w-full h-full object-cover select-none" />
                                            {allImages.length > 1 && (
                                                <>
                                                    <button onClick={() => setSelectedIdx((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/55 transition-all opacity-0 group-hover:opacity-100 font-bold text-xl">‹</button>
                                                    <button onClick={() => setSelectedIdx((i) => (i + 1) % allImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/55 transition-all opacity-0 group-hover:opacity-100 font-bold text-xl">›</button>
                                                    <div className="absolute bottom-2 right-3 text-xs text-white bg-black/40 px-2 py-0.5 rounded-full">{selectedIdx + 1} / {allImages.length}</div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <span className="text-4xl">🏠</span><span className="text-sm italic">Sin imágenes</span>
                                        </div>
                                    )}
                                </div>

                                {allImages.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {allImages.map((url, idx) => (
                                            <button key={idx} onClick={() => setSelectedIdx(idx)} className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${idx === selectedIdx ? "border-emerald-500 shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}>
                                                <img src={url} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* COLUMNA DERECHA: Información */}
                            <div className="flex flex-col gap-5">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">Precio</p>
                                    <p className="text-3xl font-extrabold text-emerald-600">
                                        {property.price_eur ? `${Number(property.price_eur).toLocaleString("es-ES")} €` : "—"}
                                    </p>
                                </div>

                                <div className="flex items-start gap-2 text-slate-600">
                                    <span className="text-base flex-shrink-0">📍</span>
                                    <span className="text-sm font-medium">{property.location || "Ubicación no especificada"}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex flex-col items-center bg-slate-50 rounded-xl px-2 py-3 gap-1 border border-slate-100">
                                        <span className="text-2xl">🛏️</span>
                                        <span className="text-lg font-bold text-slate-800">{property.rooms ?? "—"}</span>
                                        <span className="text-xs text-slate-500">Habitaciones</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-slate-50 rounded-xl px-2 py-3 gap-1 border border-slate-100">
                                        <span className="text-2xl">🚿</span>
                                        <span className="text-lg font-bold text-slate-800">{property.bathrooms ?? "—"}</span>
                                        <span className="text-xs text-slate-500">Baños</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-slate-50 rounded-xl px-2 py-3 gap-1 border border-slate-100">
                                        <span className="text-2xl">📐</span>
                                        <span className="text-lg font-bold text-slate-800">{property.area ? `${property.area}` : "—"}</span>
                                        <span className="text-xs text-slate-500">m²</span>
                                    </div>
                                </div>

                                {property.description && (
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-2">Descripción</p>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
                                    </div>
                                )}

                                {property.owner && (
                                    <div className="mt-auto pt-4 border-t border-slate-100">
                                        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">Anunciante</p>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">{ownerInitial}</div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{property.owner.name}</p>
                                                    {property.owner.email && <p className="text-xs text-slate-400 truncate">{property.owner.email}</p>}
                                                </div>
                                            </div>
                                            {property.owner.email && (
                                                <a href={`mailto:${property.owner.email}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                                                    ✉️ Contactar
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body // 👈 Destino del teletransporte
    );
}