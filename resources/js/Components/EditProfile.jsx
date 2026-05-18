import React from "react";

export default function EditProfile({ onNavigate }) {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);

    React.useEffect(() => {
        try {
            const raw = localStorage.getItem("nestly_user");
            if (raw) {
                const user = JSON.parse(raw);
                setName(user.name || "");
                setEmail(user.email || "");
            }
        } catch (e) {
            // ignore
        }
    }, []);

    async function handleSave() {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");
            const res = await fetch("/user/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                },
                credentials: "same-origin",
                body: JSON.stringify({ name, email }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Error al actualizar");
            }

            const data = await res.json();
            // update localStorage
            try {
                localStorage.setItem("nestly_user", JSON.stringify(data.user));
            } catch (e) {}

            setSuccess("Perfil actualizado correctamente");
        } catch (e) {
            setError(e.message || "Error desconocido");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-emerald-50 flex items-start justify-center py-12">
            <button
                type="button"
                onClick={() => onNavigate && onNavigate("home")}
                className="fixed top-4 left-4 px-3 py-1 rounded-md text-sm text-slate-900 border border-black bg-white hover:bg-slate-50 z-50"
            >
                ← Volver
            </button>
            <div className="w-full max-w-md px-4 pt-16">
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Editar perfil</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-700 mb-1">
                                Nombre
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                        </div>

                        {error && <div className="text-red-600">{error}</div>}
                        {success && (
                            <div className="text-green-600">{success}</div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-emerald-600 text-white rounded"
                            >
                                {loading ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button
                                onClick={() => onNavigate && onNavigate("home")}
                                className="px-4 py-2 bg-white border rounded"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
