// resources/js/Components/ModeViews/PropertyDetailView.jsx
import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";

function isValidImageUrl(url) {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("http://") || url.startsWith("https://")) return true;
    return /\.(jpe?g|png|gif|webp|bmp|svg)(\?|#|$)/i.test(url);
}

const STATUS_LABEL = {
    available: "Disponible",
    sold: "Vendido",
    rented: "Alquilado",
};

const STATUS_COLOR = {
    available: "bg-emerald-100 text-emerald-800",
    sold: "bg-red-100 text-red-800",
    rented: "bg-yellow-100 text-yellow-800",
};

export default function PropertyDetailView({ property, onClose }) {
    const allImages = useMemo(() => {
        const list = [];
        if (isValidImageUrl(property.primary_image)) {
            list.push(property.primary_image);
        }
        if (Array.isArray(property.images)) {
            property.images.forEach((img) => {
                const url = img?.url || img;
                if (isValidImageUrl(url) && !list.includes(url)) {
                    list.push(url);
                }
            });
        }
        if (list.length === 0) {
            list.push("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80");
        }
        return list;
    }, [property]);

    const [activeImgIndex, setActiveImgIndex] = useState(0);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        
        return () => {
            document.body.style.overflow = originalOverflow || "unset";
        };
    }, []);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") {
                onClose();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return createPortal(
        <>
            {/* Capa de fondo oscuro con desenfoque */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99998] transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Contenedor principal centrado del Layout */}
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
                
                {/* TARJETA BLANCA CONTENEDORA */}
                <div className="bg-white w-full max-w-4xl rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] relative transition-all duration-300 transform scale-100">
                    
                    {/* Botón de cerrar flotante superior */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-slate-700 hover:text-slate-900 w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all hover:scale-105 z-50 text-lg font-bold"
                        title="Cerrar"
                    >
                        ✕
                    </button>

                    {/* CUERPO INTERNO CON SCROLL AUTÓNOMO */}
                    <div className="overflow-y-auto p-4 sm:p-8 space-y-6 flex-grow">
                        
                        {/* Cabecera de Título y Ubicación */}
                        <div className="space-y-2 pr-10">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                    {property.title}
                                </h2>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        STATUS_COLOR[property.status] || "bg-slate-100 text-slate-800"
                                    }`}
                                >
                                    {STATUS_LABEL[property.status] || property.status}
                                </span>
                            </div>
                            {property.location && (
                                <p className="text-slate-500 flex items-center gap-1.5 text-sm sm:text-base">
                                    📍 {property.location}
                                </p>
                            )}
                        </div>

                        {/* Carrusel de Imágenes */}
                        <div className="space-y-3">
                            <div className="relative h-64 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-900 group shadow-inner">
                                <img
                                    src={allImages[activeImgIndex]}
                                    alt={`${property.title} - ${activeImgIndex + 1}`}
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
                                
                                {allImages.length > 1 && (
                                    <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                                            }}
                                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full text-slate-800 font-bold hover:bg-white shadow pointer-events-auto flex items-center justify-center transition-transform active:scale-95"
                                        >
                                            ◀
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                                            }}
                                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full text-slate-800 font-bold hover:bg-white shadow pointer-events-auto flex items-center justify-center transition-transform active:scale-95"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Miniaturas inferiores */}
                            {allImages.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImgIndex(i)}
                                            className={`relative w-20 h-14 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                                                i === activeImgIndex ? "border-emerald-500 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                                            }`}
                                        >
                                            <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CUADRÍCULA DE DETALLES TÉCNICOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Columna Izquierda: Características básicas y Descripción */}
                            <div className="space-y-5">
                                <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <span className="text-lg">🛏️</span>
                                        <span className="font-semibold text-sm">
                                            {property.rooms ?? "—"} habs
                                        </span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-200" />
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <span className="text-lg">🚿</span>
                                        <span className="font-semibold text-sm">
                                            {property.bathrooms ?? "—"} baños
                                        </span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-200" />
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <span className="text-lg">📐</span>
                                        <span className="font-semibold text-sm">
                                            {property.area ? `${property.area} m²` : "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-800">
                                        Descripción
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                        {property.description || "Sin descripción disponible."}
                                    </p>
                                </div>
                            </div>

                            {/* Columna Derecha: Tarjeta de Contacto / Propietario */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col justify-between space-y-4 self-start shadow-sm">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Precio de Venta
                                    </span>
                                    <div className="text-3xl font-black text-emerald-600">
                                        {property.price_eur
                                            ? `${property.price_eur.toLocaleString("es-ES")} €`
                                            : "Consultar precio"}
                                    </div>
                                </div>

                                {property.owner && (
                                    <div className="pt-4 border-t border-slate-200/60 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Contacto del Anunciante
                                        </h4>
                                        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-9 h-9 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-sm flex-shrink-0ord">
                                                    {property.owner.name ? property.owner.name.charAt(0).toUpperCase() : "U"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">
                                                        {property.owner.name || "Usuario Nestly"}
                                                    </p>
                                                    {property.owner.email && (
                                                        <p className="text-xs text-slate-400 truncate">
                                                            {property.owner.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {property.owner.email && (
                                                <a
                                                    href={`mailto:${property.owner.email}`}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex-shrink-0"
                                                >
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
        document.body
    );
}