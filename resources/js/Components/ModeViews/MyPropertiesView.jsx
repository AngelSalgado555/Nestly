// resources/js/Components/ModeViews/MyPropertiesView.jsx
import React from "react";
import PropertyCard from "./PropertyCard";
import PropertyDetailView from "./PropertyDetailView";
import PropertyFormModal from "./PropertyFormModal";

export default function MyPropertiesView() {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [editing, setEditing] = React.useState(null); // Propiedad siendo editada
    const [viewingDetail, setViewingDetail] = React.useState(null); // Ficha de detalle

    // Carga de propiedades (Mantiene tu lógica exacta original)
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

// Subcomponente del Modal de Edición inmutable (Mantiene tus estados y lógica de subida de imágenes FormData)
function EditPropertyModal({ property, onClose, onUpdated }) {
    const [title, setTitle] = React.useState(property.title || "");
    const [description, setDescription] = React.useState(
        property.description || "",
    );
    const [location, setLocation] = React.useState(property.location || "");
    const [price, setPrice] = React.useState(property.price_eur ?? "");
    const [rooms, setRooms] = React.useState(property.rooms ?? "");
    const [bathrooms, setBathrooms] = React.useState(property.bathrooms ?? "");
    const [area, setArea] = React.useState(property.area ?? "");
    const [status, setStatus] = React.useState(property.status || "available");
    const [files, setFiles] = React.useState([]);
    const [previews, setPreviews] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const inputRef = React.useRef(null);
    const MAX_FILES = 10;

    React.useEffect(() => {
        return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
    }, [previews]);

    function openFileDialog() {
        if (inputRef.current) inputRef.current.click();
    }

    function handleFiles(e) {
        const list = Array.from(e.target.files || []);
        if (!list.length) return;
        const newFiles = [...files, ...list].slice(0, MAX_FILES);
        const newPreviews = newFiles.map((f) => ({
            file: f,
            url: URL.createObjectURL(f),
        }));
        previews.forEach((p) => URL.revokeObjectURL(p.url));
        setFiles(newFiles);
        setPreviews(newPreviews);
        if (inputRef.current) inputRef.current.value = null;
    }

    function removeFile(idx) {
        const newFiles = [...files];
        newFiles.splice(idx, 1);
        const newPreviews = [...previews];
        const removed = newPreviews.splice(idx, 1)[0];
        if (removed) URL.revokeObjectURL(removed.url);
        setFiles(newFiles);
        setPreviews(newPreviews);
    }

    async function submit() {
        setLoading(true);
        setError(null);
        try {
            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const fd = new FormData();
            if (title !== "") fd.append("title", title);
            if (description !== "") fd.append("description", description);
            if (location !== "") fd.append("location", location);
            if (price !== "") fd.append("price", price);
            if (rooms !== "") fd.append("rooms", rooms);
            if (bathrooms !== "") fd.append("bathrooms", bathrooms);
            if (area !== "") fd.append("area", area);
            if (status !== "") fd.append("status", status);
            files.forEach((f) => fd.append("images[]", f));
            fd.append("_method", "PUT");

            const res = await fetch(`/properties/${property.id}`, {
                method: "POST",
                headers: { "X-CSRF-TOKEN": csrf },
                credentials: "same-origin",
                body: fd,
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.message || "Error al actualizar");
            }
            const data = await res.json();
            if (data && data.property) onUpdated(data.property);
        } catch (e) {
            setError(e.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h3 className="text-lg font-semibold text-slate-800">
                        Editar propiedad
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                    >
                        ✕
                    </button>
                </div>
                <div className="space-y-3">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Título"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        rows={3}
                        placeholder="Descripción"
                    />
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Ubicación"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="px-3 py-2 border rounded"
                            placeholder="Precio (€)"
                        />
                        <input
                            value={rooms}
                            onChange={(e) => setRooms(e.target.value)}
                            className="px-3 py-2 border rounded"
                            placeholder="Habitaciones"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            value={bathrooms}
                            onChange={(e) => setBathrooms(e.target.value)}
                            className="px-3 py-2 border rounded"
                            placeholder="Baños"
                        />
                        <input
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="px-3 py-2 border rounded"
                            placeholder="Área (m²)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-slate-600 font-medium">
                            Estado
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-3 py-2 border rounded bg-slate-50 w-full"
                        >
                            <option value="available">Disponible</option>
                            <option value="sold">Vendido</option>
                            <option value="rented">Alquilado</option>
                            <option value="unavailable">No disponible</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1 font-medium">
                            Añadir imágenes (máx {MAX_FILES})
                        </label>
                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFiles}
                            className="hidden"
                            aria-hidden="true"
                        />
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={openFileDialog}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 transition-colors text-sm"
                            >
                                Seleccionar imágenes
                            </button>
                            <span className="text-sm text-slate-500">
                                {files.length} / {MAX_FILES} seleccionadas
                            </span>
                        </div>
                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-3">
                                {previews.map((pv, i) => (
                                    <div
                                        key={i}
                                        className="relative border rounded overflow-hidden"
                                    >
                                        <img
                                            src={pv.url}
                                            alt={pv.file.name}
                                            className="w-full h-22 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="absolute top-1 right-1 bg-white/80 rounded-full w-5 h-5 flex items-center justify-center text-red-600 font-bold hover:bg-white"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                    )}
                    <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors text-sm font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
