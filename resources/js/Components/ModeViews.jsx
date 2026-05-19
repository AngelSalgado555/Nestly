import React from "react";
import Navbar from "./Navbar";
import PropertyForm from "./PropertyForm";
import fondo from "../../images/Fondo.png";

export function BuyerView() {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [page, setPage] = React.useState(1);
    const [pagination, setPagination] = React.useState(null);

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

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
                Buscador de pisos (Modo Comprador)
            </h2>

            {loading && <div>Cargando propiedades...</div>}
            {error && <div className="text-red-600">Error: {error}</div>}

            {!loading && !error && (
                <div className="space-y-4">
                    {properties.length === 0 ? (
                        <div className="text-slate-600">
                            No hay propiedades publicadas.
                        </div>
                    ) : (
                        properties.map((p) => {
                            const imageUrl =
                                p.primary_image ||
                                (p.images && p.images.length
                                    ? p.images[0].url
                                    : null);
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
                setProperties(data || []);
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
                            const imageUrl =
                                p.primary_image ||
                                (p.images && p.images.length
                                    ? p.images[0].url
                                    : null);
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
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    function handleFiles(e) {
        setFiles(Array.from(e.target.files || []));
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
                        <label className="block text-sm mb-1">
                            Añadir imágenes (opcional)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFiles}
                        />
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

export default function ModeApp({ onNavigate }) {
    function readStoredMode() {
        try {
            const v = localStorage.getItem("nestly_mode");
            return v ? v : "comprador";
        } catch (e) {
            return "comprador";
        }
    }

    const [modo, setModoRaw] = React.useState(readStoredMode());

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
            <div className="w-full max-w-2xl px-4 pt-16 relative z-10">
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/40 p-6">
                    {/* Navbar with mode switch */}
                    <Navbar
                        modo={modo}
                        setModo={setModo}
                        onNavigate={onNavigate}
                    />

                    <div className="mt-6">
                        {modo === "comprador" ? (
                            <BuyerView />
                        ) : modo === "vendedor" ? (
                            <SellerView />
                        ) : (
                            <MyPropertiesView />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
