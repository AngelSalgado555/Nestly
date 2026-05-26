// resources/js/Components/ModeViews/BuyerView.jsx
import React from "react";
// Importamos la tarjeta común desde su misma carpeta
import PropertyCard from "./PropertyCard";
import PropertyDetailView from "./PropertyDetailView";

export default function BuyerView({ filters }) {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [page, setPage] = React.useState(1);
    const [pagination, setPagination] = React.useState(null);
    const [favorites, setFavorites] = React.useState({});
    const [viewingDetail, setViewingDetail] = React.useState(null);

    // Carga de datos original desde /properties
    React.useEffect(() => {
        let mounted = true;
        async function fetchProperties(p = 1) {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/properties?page=${p}`, {
                    credentials: "same-origin",
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || `Error ${res.status}`);
                }
                const data = await res.json();
                if (!mounted) return;

                const items = data.data ?? data;
                setProperties(items);

                const favMap = {};
                items.forEach((p) => {
                    favMap[p.id] = !!p.is_favorite;
                });
                setFavorites(favMap);
                setPagination(data.meta ?? null);
            } catch (err) {
                if (!mounted) return;
                setError(err.message || "Error al cargar propiedades");
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }

        fetchProperties(page);
        return () => {
            mounted = false;
        };
    }, [page]);

    // Gestión de favoritos original
    async function toggleFavorite(propertyId, e) {
        e.stopPropagation();
        const csrf =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";
        try {
            const res = await fetch(`/favorites/${propertyId}`, {
                method: "POST",
                headers: { "X-CSRF-TOKEN": csrf },
                credentials: "same-origin",
            });
            if (res.ok) {
                const data = await res.json();
                setFavorites((prev) => ({
                    ...prev,
                    [propertyId]: data.is_favorite,
                }));
            }
        } catch (err) {
            // silencio
            console.log("Ha ocurrido un error: " + err);
        }
    }

    const pisosFiltrados = (properties || []).filter((p) => {
        let cumpleTexto = true;
        if (filters && filters.busqueda) {
            const textoBuscado = filters.busqueda.toLowerCase();
            const tituloPiso = p.title ? p.title.toLowerCase() : "";
            const ubicacionPiso = p.location ? p.location.toLowerCase() : "";

            const enTitulo = tituloPiso.includes(textoBuscado);
            const enUbicacion = ubicacionPiso.includes(textoBuscado);

            if (!enTitulo && !enUbicacion) {
                cumpleTexto = false;
            }
        }

        let cumplePrecio = true;
        if (filters && filters.precioMax) {
            const precioMax = Number(p.price_eur || p.price || 0);
            const precioMaxUsuario = Number(filters.precioMax);
            if (precioMax > precioMaxUsuario) {
                cumplePrecio = false;
            }
        }

        let cumpleHabitaciones = true;
        if (filters && filters.habitaciones) {
            const habitacionesPiso = Number(p.rooms || 0);
            const habitacionesPisoUsuario = Number(filters.habitaciones);

            if (habitacionesPiso !== habitacionesPisoUsuario) {
                cumpleHabitaciones = false;
            }
        }

        return cumpleTexto && cumplePrecio && cumpleHabitaciones;
    });

    if (loading)
        return (
            <div className="p-4 text-slate-600">Cargando propiedades...</div>
        );
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    return (
        <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-xl font-bold mb-4 text-slate-800">
                Buscador de pisos
            </h2>

            <div className="space-y-6">
                {pisosFiltrados.length === 0 ? (
                    <div className="text-slate-600">
                        No hay propiedades que coincidan con los filtros
                        aplicados.
                    </div>
                ) : (
                    /* Renderizado en grid reutilizando el componente PropertyCard */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pisosFiltrados.map((p) => (
                            <PropertyCard
                                key={p.id}
                                property={p}
                                modo="comprador"
                                isFavorite={!!favorites[p.id]}
                                toggleFavorite={toggleFavorite}
                                setEditing={null}
                                onViewDetail={setViewingDetail}
                            />
                        ))}
                    </div>
                )}

                {/* Modal de ficha detalle */}
                {viewingDetail && (
                    <PropertyDetailView
                        property={viewingDetail}
                        onClose={() => setViewingDetail(null)}
                    />
                )}

                {/* Paginación original */}
                {pagination && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-slate-600">
                            Página {pagination.current_page} de{" "}
                            {pagination.last_page}
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.current_page <= 1}
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 text-sm font-medium"
                            >
                                Anterior
                            </button>
                            <button
                                disabled={
                                    pagination.current_page >=
                                    pagination.last_page
                                }
                                onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 text-sm font-medium"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
