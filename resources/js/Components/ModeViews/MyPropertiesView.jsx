// resources/js/Components/ModeViews/MyPropertiesView.jsx
import React from "react";
import PropertyCard from "./PropertyCard";
import PropertyDetailView from "./PropertyDetailView";
import PropertyFormModal from "./PropertyFormModal";

export default function MyPropertiesView() {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [editing, setEditing] = React.useState(null);
    const [viewingDetail, setViewingDetail] = React.useState(null);

    React.useEffect(() => {
        let mounted = true;
        async function fetchMy() {
            setLoading(true);
            setError(null);
            try {
                let raw = null;
                try {
                    raw = localStorage.getItem("nestly_user");
                } catch (e) {
                    raw = null;
                }
                let userId = null;
                if (raw) {
                    try {
                        userId = JSON.parse(raw).id;
                    } catch (e) {
                        userId = null;
                    }
                }
                if (!userId) {
                    const resUser = await fetch("/user", {
                        credentials: "same-origin",
                    });
                    if (!resUser.ok) throw new Error("No autenticado");
                    const u = await resUser.json();
                    userId = u.id;
                }

                const res = await fetch(`/users/${userId}/properties`, {
                    credentials: "same-origin",
                });
                if (!res.ok) throw new Error("Error al obtener propiedades");
                const data = await res.json();
                if (!mounted) return;
                setProperties(data.data ?? data ?? []);
            } catch (err) {
                if (!mounted) return;
                setError(err.message || "Error");
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }
        fetchMy();
        return () => {
            mounted = false;
        };
    }, []);

    function handleUpdated(updated) {
        setProperties((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        setEditing(null);
    }

    if (loading) return <div className="p-6">Cargando...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-800">
                Mis piezas
            </h2>

            {properties.length === 0 ? (
                <div className="text-slate-600">
                    No has publicado propiedades aún.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((p) => (
                        <PropertyCard
                            key={p.id}
                            property={p}
                            modo="vendedor"
                            isFavorite={false}
                            toggleFavorite={null}
                            setEditing={setEditing}
                            onViewDetail={setViewingDetail}
                        />
                    ))}
                </div>
            )}

            {/* Modal de edición */}
            {editing && (
                <PropertyFormModal
                    property={editing}
                    onClose={() => setEditing(null)}
                    onUpdated={handleUpdated}
                />
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
