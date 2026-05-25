// resources/js/Components/ModeViews/FavoritesView.jsx
import React from "react";
// Importamos la tarjeta que creamos y renombramos juntos
import PropertyCard from "./PropertyCard";

export default function FavoritesView() {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Fetch para cargar los favoritos guardados (Tu lógica original de la línea 266)
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
                
                // Guardamos los ítems devueltos
                setProperties(data.data ?? data);
            } catch (err) {
                if (!mounted) return;
                setError(err.message);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchFavorites();
        return () => {
            mounted = false;
        };
    }, []);

    // Función para quitar de favoritos desde esta misma vista (Tu lógica original de la línea 286)
    async function toggleFavorite(propertyId, e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // En esta vista, al desmarcar el corazón quitamos el piso de la lista inmediatamente (Optimistic update)
        const originalProperties = [...properties];
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));

        try {
            const res = await fetch(`/favorites/${propertyId}`, {
                method: "DELETE", // Siempre es DELETE porque estamos quitando de la vista de favoritos
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                    Accept: "application/json",
                },
            });
            if (!res.ok) {
                // Si el servidor falla, revertimos el cambio y devolvemos el piso a la lista
                setProperties(originalProperties);
            }
        } catch (err) {
            setProperties(originalProperties);
        }
    }

    // Renderizado de estados de Carga o Error
    if (loading) return <div className="p-4 text-slate-600">Cargando tus favoritos...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-slate-800">
                Mis Favoritos ({properties.length})
            </h2>

            {properties.length === 0 ? (
                <p className="text-slate-500">Aún no has guardado ninguna propiedad en tus favoritos.</p>
            ) : (
                /* Contenedor en Grid usando la tarjeta común */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((p) => (
                        <PropertyCard
                            key={p.id}
                            property={p}
                            modo="comprador" // Sigue siendo un comportamiento de comprador
                            isFavorite={true} // Como estamos en la vista de favoritos, todos son true por defecto
                            toggleFavorite={toggleFavorite} // Pasamos la función de eliminar de arriba
                            setEditing={null} // En favoritos no se edita el piso
                        />
                    ))}
                </div>
            )}
        </div>
    );
}