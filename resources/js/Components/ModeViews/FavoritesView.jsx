// resources/js/Components/ModeViews/FavoritesView.jsx
import React from "react";
import PropertyCard from "./PropertyCard";
import PropertyDetailView from "./PropertyDetailView";

export default function FavoritesView() {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [viewingDetail, setViewingDetail] = React.useState(null);

    // Carga de favoritos desde el servidor
    React.useEffect(() => {
        let mounted = true;
        async function fetchFavorites() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/favorites", {
                    credentials: "same-origin",
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || `Error ${res.status}`);
                }
                const data = await res.json();
                if (!mounted) return;

                setProperties(data.data ?? data ?? []);
            } catch (err) {
                if (!mounted) return;
                setError(err.message || "Error al cargar favoritos");
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }
        fetchFavorites();
        return () => {
            mounted = false;
        };
    }, []);

    // Función para quitar de favoritos inmediatamente en esta vista (Desmarcar corazón)
    async function toggleFavorite(propertyId, e) {
        if (e) e.stopPropagation();

        // Optimistic update: lo quitamos de la lista visual al momento
        const backup = [...properties];
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));

        try {
            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch(`/favorites/${propertyId}`, {
                method: "POST",
                headers: { "X-CSRF-TOKEN": csrf },
                credentials: "same-origin",
            });
            if (!res.ok) {
                // Si el servidor falla, revertimos el cambio
                setProperties(backup);
            }
        } catch (err) {
            setProperties(backup);
        }
    }

    if (loading)
        return <div className="p-4 text-slate-600">Cargando favoritos...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    return (
        <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-xl font-bold mb-4 text-slate-800">
                Mis Favoritos ({properties.length})
            </h2>

            {properties.length === 0 ? (
                <div className="text-slate-600">
                    Aún no tienes propiedades guardadas en favoritos.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.map((p) => (
                        <PropertyCard
                            key={p.id}
                            property={p}
                            modo="comprador"
                            isFavorite={true}
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
        </div>
    );
}
