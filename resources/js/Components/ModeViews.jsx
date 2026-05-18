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
                // Laravel paginator returns { data: [...], meta: {...}, links: {...} }
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
                        properties.map((p) => (
                            <div
                                key={p.id}
                                className="border rounded p-4 bg-white shadow-sm"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {p.title}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {p.location}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Por:{" "}
                                            {p.owner?.name ?? "Desconocido"}
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
                                            {p.area ? `${p.area} m²` : "—"}
                                        </div>
                                    </div>
                                </div>
                                {p.description && (
                                    <p className="mt-2 text-sm text-slate-700">
                                        {p.description}
                                    </p>
                                )}
                            </div>
                        ))
                    )}

                    {/* Simple pagination controls */}
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
                        {modo === "comprador" ? <BuyerView /> : <SellerView />}
                    </div>
                </div>
            </div>
        </div>
    );
}
