// resources/js/Components/ModeViews/PropertyCard.jsx
import React from "react";

/** Devuelve true solo si la URL parece una imagen real (tiene extensión de imagen) */
function isValidImageUrl(url) {
    return (
        Boolean(url) &&
        typeof url === "string" &&
        /\.(jpe?g|png|gif|webp|bmp|svg)(\?|#|$)/i.test(url)
    );
}

export default function PropertyCard({
    property,
    modo = "comprador",
    isFavorite = false,
    toggleFavorite = null,
    setEditing = null,
    onViewDetail = null,
}) {
    // 1. Recopilamos todas las imágenes válidas disponibles del piso
    const allImages = React.useMemo(() => {
        const list = [];
        // Si hay una imagen primaria destacada, la ponemos primero
        if (isValidImageUrl(property.primary_image)) {
            list.push(property.primary_image);
        }
        // Añadimos las demás imágenes del array si existen
        if (Array.isArray(property.images)) {
            property.images.forEach((img) => {
                const url = img?.url || img;
                if (isValidImageUrl(url) && !list.includes(url)) {
                    list.push(url);
                }
            });
        }
        return list;
    }, [property]);

    // Estado para controlar qué imagen se está mostrando en el carrusel
    const [currentIdx, setCurrentIdx] = React.useState(0);

    // Funciones para navegar por las fotos
    function nextImage(e) {
        e.stopPropagation(); // Evita que se disparen clicks raros en la tarjeta
        setCurrentIdx((prev) => (prev + 1) % allImages.length);
    }

    function prevImage(e) {
        e.stopPropagation();
        setCurrentIdx(
            (prev) => (prev - 1 + allImages.length) % allImages.length,
        );
    }

    return (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full border-slate-100 transition-all hover:shadow-md group">
            {/* Zona superior: CONTENEDOR DEL CARRUSEL */}
            <div className="relative w-full h-48 bg-slate-100 flex-shrink-0 overflow-hidden">
                {allImages.length > 0 ? (
                    <>
                        {/* Imagen actual en pantalla */}
                        <img
                            src={allImages[currentIdx]}
                            alt={`${property.title} - Foto ${currentIdx + 1}`}
                            className="w-full h-full object-cover select-none transition-all duration-300"
                        />

                        {/* FLECHAS DE NAVEGACIÓN (Solo se muestran si hay más de 1 imagen) */}
                        {allImages.length > 1 && (
                            <>
                                {/* Flecha Izquierda */}
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 z-10 font-bold"
                                    title="Imagen anterior"
                                >
                                    ‹
                                </button>
                                {/* Flecha Derecha */}
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 z-10 font-bold"
                                    title="Siguiente imagen"
                                >
                                    ›
                                </button>

                                {/* CONTADORES / PUNTITOS (Dots inferiores) */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-2 py-1 rounded-full backdrop-blur-[2px]">
                                    {allImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentIdx(idx);
                                            }}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                idx === currentIdx
                                                    ? "bg-white scale-125"
                                                    : "bg-white/50"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 text-sm italic">
                        Sin imagen disponible
                    </div>
                )}

                {/* BOTÓN DE FAVORITOS */}
                {modo === "comprador" && toggleFavorite && (
                    <button
                        onClick={(e) => toggleFavorite(property.id, e)}
                        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors z-10"
                        title={
                            isFavorite
                                ? "Quitar de favoritos"
                                : "Añadir a favoritos"
                        }
                    >
                        <span
                            className={`text-xl leading-none ${isFavorite ? "text-rose-500" : "text-slate-400"}`}
                        >
                            {isFavorite ? "♥" : "♡"}
                        </span>
                    </button>
                )}
            </div>

            {/* Zona inferior: Información del piso */}
            <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                    {/* Título y Estado */}
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-semibold text-base text-slate-800 line-clamp-1">
                            {property.title}
                        </h3>
                        {property.status && (
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                    property.status === "available"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : property.status === "sold"
                                          ? "bg-red-100 text-red-800"
                                          : property.status === "rented"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-slate-100 text-slate-800"
                                }`}
                            >
                                {property.status === "available"
                                    ? "Disponible"
                                    : property.status === "sold"
                                      ? "Vendido"
                                      : property.status === "rented"
                                        ? "Alquilado"
                                        : "No disponible"}
                            </span>
                        )}
                    </div>

                    {/* BOTÓN VER DETALLE */}
                    {onViewDetail && (
                        <button
                            onClick={() => onViewDetail(property)}
                            className="mt-2 mb-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-xs font-medium transition-colors shadow-sm"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3.5 h-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M10 3C5 3 1.73 7.11 1.05 9.78a1 1 0 0 0 0 .44C1.73 12.89 5 17 10 17s8.27-4.11 8.95-6.78a1 1 0 0 0 0-.44C18.27 7.11 15 3 10 3Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                            </svg>
                            Ver detalle del piso
                        </button>
                    )}

                    {/* Ubicación */}
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                        📍 {property.location}
                    </p>

                    {/* Propietario (Solo visible para compradores) */}
                    {modo === "comprador" && (
                        <p className="text-xs text-slate-400 mb-3">
                            Por: {property.owner?.name ?? "Desconocido"}
                        </p>
                    )}

                    {/* Descripción */}
                    {property.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1 mb-4">
                            {property.description}
                        </p>
                    )}
                </div>

                {/* Precios, Características y Acciones */}
                <div className="mt-auto pt-3 border-t border-slate-50">
                    <div className="flex justify-between items-center mb-3">
                        <div className="font-bold text-lg text-emerald-600">
                            {property.price_eur
                                ? `${property.price_eur.toLocaleString("es-ES")} €`
                                : "—"}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                            {property.rooms ?? "—"} hab ·{" "}
                            {property.bathrooms ?? "—"} baños ·{" "}
                            {property.area ? `${property.area} m²` : "—"}
                        </div>
                    </div>

                    {/* BOTÓN DE EDITAR (Solo en modo vendedor) */}
                    {modo === "vendedor" && setEditing && (
                        <button
                            onClick={() => setEditing(property)}
                            className="w-full text-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors"
                        >
                            Editar Propiedad
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
