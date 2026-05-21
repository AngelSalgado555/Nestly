import React from "react";
import Navbar from "./Navbar";
import PropertyForm from "./PropertyForm";
import fondo from "../../images/Fondo.png";

/** Devuelve true solo si la URL parece una imagen real (tiene extensión de imagen) */
function isValidImageUrl(url) {
    return (
        Boolean(url) &&
        typeof url === "string" &&
        /\.(jpe?g|png|gif|webp|bmp|svg)(\?|#|$)/i.test(url)
    );
}

export function BuyerView({ filters }) {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [page, setPage] = React.useState(1);
    const [pagination, setPagination] = React.useState(null);
    const [favorites, setFavorites] = React.useState({});
    

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
            // silently fail
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

            if (habitacionesPiso < habitacionesPisoUsuario) {
                cumpleHabitaciones = false;
            }
        }

        return cumpleTexto && cumplePrecio && cumpleHabitaciones;
        
    });
    return (
        <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-xl font-bold mb-4">
                Buscador de pisos
            </h2>

            {loading && <div>Cargando propiedades...</div>}
            {error && <div className="text-red-600">Error: {error}</div>}

            {!loading && !error && (
                <div className="space-y-6">
                    {properties.length === 0 ? (
                        <div className="text-slate-600">
                            No hay propiedades publicadas.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {properties.map((p) => {
                                const rawUrl =
                                    p.primary_image || p.images?.[0]?.url || null;
                                const imageUrl = isValidImageUrl(rawUrl)
                                    ? rawUrl
                                    : null;
                                return (
                                    <div
                                        key={p.id}
                                        className="border rounded p-0 bg-white shadow-sm overflow-hidden"
                                    >
                                        {imageUrl ? (
                                            <div className="relative w-full h-48 md:h-84 bg-slate-100">
                                                <img
                                                    src={imageUrl}
                                                    alt={p.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={(e) =>
                                                        toggleFavorite(p.id, e)
                                                    }
                                                    className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
                                                    title={
                                                        favorites[p.id]
                                                            ? "Quitar de favoritos"
                                                            : "Añadir a favoritos"
                                                    }
                                                >
                                                    <span
                                                        className={`text-xl leading-none ${favorites[p.id] ? "text-rose-500" : "text-slate-400"}`}
                                                    >
                                                        {favorites[p.id]
                                                            ? "♥"
                                                            : "♡"}
                                                    </span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-14 bg-slate-50 flex items-center justify-end px-2">
                                                <button
                                                    onClick={(e) =>
                                                        toggleFavorite(p.id, e)
                                                    }
                                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
                                                    title={
                                                        favorites[p.id]
                                                            ? "Quitar de favoritos"
                                                            : "Añadir a favoritos"
                                                    }
                                                >
                                                    <span
                                                        className={`text-xl leading-none ${favorites[p.id] ? "text-rose-500" : "text-slate-400"}`}
                                                    >
                                                        {favorites[p.id]
                                                            ? "♥"
                                                            : "♡"}
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                                        {p.title}
                                                        {p.status && (
                                                            <span
                                                                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "available" ? "bg-emerald-100 text-emerald-800" : p.status === "sold" ? "bg-red-100 text-red-800" : p.status === "rented" ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-800"}`}
                                                            >
                                                                {p.status ===
                                                                "available"
                                                                    ? "Disponible"
                                                                    : p.status ===
                                                                        "sold"
                                                                    ? "Vendido"
                                                                    : p.status ===
                                                                        "rented"
                                                                    ? "Alquilado"
                                                                    : "No disponible"}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-slate-600">
                                                        {p.location}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        Por:{" "}
                                                        {p.owner?.name ??
                                                            "Desconocido"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-emerald-600">
                                                        {p.price_eur
                                                            ? `${p.price_eur.toFixed(2)} €`
                                                            : "—"}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {p.rooms ?? "—"} hab ·{" "}
                                                        {p.bathrooms ?? "—"} baños ·{" "}
                                                        {p.area
                                                            ? `${p.area} m²`
                                                            : "—"}
                                                    </div>
                                                </div>
                                            </div>
                                            {p.description && (
                                                <p className="mt-2 text-sm text-slate-700">
                                                    {p.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

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
                                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    disabled={
                                        pagination.current_page >=
                                        pagination.last_page
                                    }
                                    onClick={() => setPage((p) => p + 1)}
                                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function SellerView() {
    const [showForm, setShowForm] = React.useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
        function onDocClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setShowForm(false);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
                Panel de gestión (Modo Vendedor)
            </h2>
            <p className="text-slate-600 mb-6">
                Aquí puedes publicar nuevas propiedades y gestionar tus
                anuncios.
            </p>

            <div className="mt-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowForm((prev) => !prev)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded font-medium shadow hover:bg-emerald-700 transition-colors"
                    >
                        {showForm ? "Cerrar formulario" : "Publicar propiedad"}
                    </button>
                </div>

                <div
                    className={`mt-4 transform origin-top transition-all duration-300 ${showForm ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}`}
                >
                    <div
                        ref={ref}
                        className="bg-white p-6 rounded-lg shadow border border-slate-200 relative"
                    >
                        <PropertyForm onPublished={() => setShowForm(false)} />
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// View para propiedades del usuario logueado
export function MyPropertiesView() {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [editing, setEditing] = React.useState(null); // property being edited

    React.useEffect(() => {
        let mounted = true;
        async function fetchMy() {
            setLoading(true);
            setError(null);
            try {
                // try read user from localStorage
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

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Mis piezas</h2>
            {loading && <div>Cargando...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && (
                <div className="space-y-4">
                    {properties.length === 0 ? (
                        <div className="text-slate-600">
                            No has publicado propiedades aún.
                        </div>
                    ) : (
                        properties.map((p) => {
                            const rawUrl =
                                p.primary_image || p.images?.[0]?.url || null;
                            const imageUrl = isValidImageUrl(rawUrl)
                                ? rawUrl
                                : null;
                            return (
                                <div
                                    key={p.id}
                                    className="border rounded p-0 bg-white shadow-sm overflow-hidden"
                                >
                                    {imageUrl && (
                                        <div className="w-full h-48 md:h-56 bg-slate-100">
                                            <img
                                                src={imageUrl}
                                                alt={p.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                                    {p.title}
                                                    {p.status && (
                                                        <span
                                                            className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "available" ? "bg-emerald-100 text-emerald-800" : p.status === "sold" ? "bg-red-100 text-red-800" : p.status === "rented" ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-800"}`}
                                                        >
                                                            {p.status ===
                                                            "available"
                                                                ? "Disponible"
                                                                : p.status ===
                                                                    "sold"
                                                                  ? "Vendido"
                                                                  : p.status ===
                                                                      "rented"
                                                                    ? "Alquilado"
                                                                    : "No disponible"}
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-slate-600">
                                                    {p.location}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        setEditing(p)
                                                    }
                                                    className="px-3 py-1 bg-gray-100 rounded"
                                                >
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                        {p.description && (
                                            <p className="mt-2 text-sm text-slate-700">
                                                {p.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {editing && (
                <EditPropertyModal
                    property={editing}
                    onClose={() => setEditing(null)}
                    onUpdated={handleUpdated}
                />
            )}
        </div>
    );
}

// Modal/componente para editar una propiedad
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

    // Liberar object URLs al desmontar
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
            // Use POST with _method=PUT so files are sent reliably to Laravel
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Editar propiedad</h3>
                    <button onClick={onClose} className="text-slate-500">
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
                        <label className="block text-sm mb-1">Estado</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-3 py-2 border rounded"
                        >
                            <option value="available">Disponible</option>
                            <option value="sold">Vendido</option>
                            <option value="rented">Alquilado</option>
                            <option value="unavailable">No disponible</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">
                            Añadir imágenes (opcional, máx {MAX_FILES})
                        </label>

                        {/* Input nativo oculto */}
                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFiles}
                            className="hidden"
                            aria-hidden="true"
                        />

                        {/* Botón personalizado */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={openFileDialog}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m8 0H8"
                                    />
                                </svg>
                                <span>Seleccionar imágenes</span>
                            </button>
                            <span className="text-sm text-slate-600">
                                {files.length} / {MAX_FILES} seleccionadas
                            </span>
                        </div>

                        {/* Previews */}
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
                                            className="w-full h-28 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 hover:bg-white"
                                            aria-label={`Eliminar ${pv.file.name}`}
                                        >
                                            ×
                                        </button>
                                        <div className="p-1 text-xs text-slate-600 truncate">
                                            {pv.file.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {error && <div className="text-red-600">{error}</div>}
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded"
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FavoritesView() {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [page, setPage] = React.useState(1);
    const [pagination, setPagination] = React.useState(null);
    const [favorites, setFavorites] = React.useState({});

    React.useEffect(() => {
        let mounted = true;
        async function fetchFavorites(p = 1) {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/favorites?page=${p}`, {
                    credentials: "same-origin",
                });
                if (!res.ok) {
                    if (res.status === 401)
                        throw new Error(
                            "Debes iniciar sesión para ver tus favoritos",
                        );
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || `Error ${res.status}`);
                }
                const data = await res.json();
                if (!mounted) return;
                const items = data.data ?? data;
                setProperties(items);
                const favMap = {};
                items.forEach((p) => {
                    favMap[p.id] = true;
                });
                setFavorites(favMap);
                setPagination(data.meta ?? null);
            } catch (err) {
                if (!mounted) return;
                setError(err.message || "Error al cargar favoritos");
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }
        fetchFavorites(page);
        return () => {
            mounted = false;
        };
    }, [page]);

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
                if (!data.is_favorite) {
                    setProperties((prev) =>
                        prev.filter((p) => p.id !== propertyId),
                    );
                    setFavorites((prev) => ({ ...prev, [propertyId]: false }));
                } else {
                    setFavorites((prev) => ({
                        ...prev,
                        [propertyId]: data.is_favorite,
                    }));
                }
            }
        } catch (err) {
            // silently fail
        }
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Mis favoritos</h2>

            {loading && <div>Cargando favoritos...</div>}
            {error && <div className="text-red-600">Error: {error}</div>}

            {!loading && !error && (
                <div className="space-y-4">
                    {properties.length === 0 ? (
                        <div className="text-slate-600 flex flex-col items-center py-8 gap-2">
                            <span className="text-4xl">♡</span>
                            <p>Aún no tienes propiedades favoritas.</p>
                            <p className="text-sm text-slate-400">
                                Pulsa el corazón en cualquier propiedad para
                                guardarla aquí.
                            </p>
                        </div>
                    ) : (
                        properties.map((p) => {
                            const rawUrl =
                                p.primary_image || p.images?.[0]?.url || null;
                            const imageUrl = isValidImageUrl(rawUrl)
                                ? rawUrl
                                : null;
                            return (
                                <div
                                    key={p.id}
                                    className="border rounded p-0 bg-white shadow-sm overflow-hidden"
                                >
                                    {imageUrl ? (
                                        <div className="relative w-full h-48 md:h-56 bg-slate-100">
                                            <img
                                                src={imageUrl}
                                                alt={p.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={(e) =>
                                                    toggleFavorite(p.id, e)
                                                }
                                                className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
                                                title="Quitar de favoritos"
                                            >
                                                <span className="text-xl leading-none text-rose-500">
                                                    ♥
                                                </span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-14 bg-slate-50 flex items-center justify-end px-2">
                                            <button
                                                onClick={(e) =>
                                                    toggleFavorite(p.id, e)
                                                }
                                                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
                                                title="Quitar de favoritos"
                                            >
                                                <span className="text-xl leading-none text-rose-500">
                                                    ♥
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                                    {p.title}
                                                    {p.status && (
                                                        <span
                                                            className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "available" ? "bg-emerald-100 text-emerald-800" : p.status === "sold" ? "bg-red-100 text-red-800" : p.status === "rented" ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-800"}`}
                                                        >
                                                            {p.status ===
                                                            "available"
                                                                ? "Disponible"
                                                                : p.status ===
                                                                    "sold"
                                                                  ? "Vendido"
                                                                  : p.status ===
                                                                      "rented"
                                                                    ? "Alquilado"
                                                                    : "No disponible"}
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-slate-600">
                                                    {p.location}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    Por:{" "}
                                                    {p.owner?.name ??
                                                        "Desconocido"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-emerald-600">
                                                    {p.price_eur
                                                        ? `${p.price_eur.toFixed(2)} €`
                                                        : "—"}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {p.rooms ?? "—"} hab ·{" "}
                                                    {p.bathrooms ?? "—"} baños ·{" "}
                                                    {p.area
                                                        ? `${p.area} m²`
                                                        : "—"}
                                                </div>
                                            </div>
                                        </div>
                                        {p.description && (
                                            <p className="mt-2 text-sm text-slate-700">
                                                {p.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {pagination && (
                        <div className="flex items-center justify-between mt-4">
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
                                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    disabled={
                                        pagination.current_page >=
                                        pagination.last_page
                                    }
                                    onClick={() => setPage((p) => p + 1)}
                                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ModeApp({ onNavigate  }) {
    function readStoredMode() {
        try {
            const v = localStorage.getItem("nestly_mode");
            return v ? v : "comprador";
        } catch (e) {
            return "comprador";
        }
    }

    const [modo, setModoRaw] = React.useState(readStoredMode());
    const [filters, setFilters] = React.useState({
        busqueda: "",
        precioMax: "",
        habitaciones: ""
    });
    const setModo = (v) => {
        setModoRaw(v);
        try {
            localStorage.setItem("nestly_mode", v);
        } catch (e) {
            // ignore
        }
    };

    return (
        <div className="min-h-screen w-full relative flex items-start justify-center py-12 isolation-auto">
            {/* CAPA DE FONDO INMUTABLE: Solución definitiva para rendimiento y compatibilidad */}
            <div
                className="fixed inset-0 w-full h-full z-0 pointer-events-none"
                style={{
                    backgroundImage: `url(${fondo})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Sutil superposición oscura para aumentar el contraste de la interfaz */}
            <div className="fixed inset-0 bg-slate-900/10 z-0 pointer-events-none " />

            {/* Contenedor de la Tarjeta */}
            <div className="w-full max-w-6xl px-4 pt-12 z-10 ml-auto pr-6">
                <Navbar
                    modo={modo}
                    setModo={setModo}
                    onNavigate={onNavigate}
                />

                {modo === "comprador" && (
                    <aside className="fixed left-6 top-24 w-72 bg-white rounded-xl shadow-xl p-5 z-40 border border-slate-100">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <span className="text-xrl"> 🔍 </span>
                            <h2 className="text-lg text-slate-800">Filtrar Pisos </h2>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            {/* Filtro 1: Texto / Palabra clave */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Ubicación o palabra clave
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Introduce la ubicación que deseas..." 
                                    value={filters.busqueda}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-700"
                                    onChange={(e) => setFilters({...filters, busqueda: e.target.value })} 
                                />
                            </div>
        
                            {/* Filtro 2: Rango de Precio */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Precio Máximo (€)
                                </label>
                                <input 
                                    type="number" 
                                    placeholder="Cualquier precio"
                                    value={filters.precioMax}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-700"
                                    onChange={(e) => setFilters({...filters, precioMax: e.target.value})}
                                />
                            </div>
        
                            {/* Filtro 3: Habitaciones */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Habitaciones mínimas
                                </label>
                                <select
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-700"
                                    value={filters.habitaciones}
                                    onChange={(e) => setFilters({ ...filters, habitaciones: e.target.value })}
                                >
                                    <option value="">Cualquiera</option>
                                    <option value="1">1+ hab</option>
                                    <option value="2">2+ hab</option>
                                    <option value="3">3+ hab</option>
                                </select>
                            </div>
        
                            {/* Botón de acción rápido */}
                            <button 
                                type="button"
                                
                                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
                            >
                                Aplicar Filtros
                            </button>
                        </form>
                    </aside>
                )}
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/40 p-6">
                    <div className="mt-6">
                        {modo === "comprador" ? (
                            <BuyerView filters={filters} />
                        ) : modo === "vendedor" ? (
                            <SellerView />
                        ) : modo === "favoritos" ? (
                            <FavoritesView />
                        ) : (
                            <MyPropertiesView />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
