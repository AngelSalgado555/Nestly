import React from "react";

export default function EditProfile({ onNavigate }) {
    // ── Datos del perfil ──────────────────────────────────────────
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");

    // ── Cambio de contraseña (opcionales) ─────────────────────────
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");

    // ── UI ────────────────────────────────────────────────────────
    const [showPasswordSection, setShowPasswordSection] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState({}); // errores por campo
    const [success, setSuccess] = React.useState(null);

    // Carga inicial desde localStorage
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem("nestly_user");
            if (raw) {
                const user = JSON.parse(raw);
                setName(user.name || "");
                setEmail(user.email || "");
            }
        } catch (e) {
            /* ignore */
        }
    }, []);

    // Cuando el usuario oculta la sección, limpiamos los campos y sus errores
    function togglePasswordSection() {
        setShowPasswordSection((v) => !v);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors((prev) => {
            const next = { ...prev };
            delete next.current_password;
            delete next.new_password;
            delete next.new_password_confirmation;
            return next;
        });
    }

    async function handleSave() {
        setLoading(true);
        setErrors({});
        setSuccess(null);

        // Validación rápida en cliente: si la sección está abierta, las nuevas contraseñas deben coincidir
        if (showPasswordSection && newPassword !== confirmPassword) {
            setErrors({
                new_password_confirmation: [
                    "Las contraseñas nuevas no coinciden.",
                ],
            });
            setLoading(false);
            return;
        }

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const body = { name, email };

            // Solo enviamos los campos de contraseña si la sección está activa y hay contenido
            if (showPasswordSection && currentPassword) {
                body.current_password = currentPassword;
                body.new_password = newPassword;
                body.new_password_confirmation = confirmPassword;
            }

            const res = await fetch("/user/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                },
                credentials: "same-origin",
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                // El backend devuelve { errors: { campo: ["mensaje"] } }
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({
                        _general: [data.message || "Error al actualizar"],
                    });
                }
                return;
            }

            // Éxito: actualizamos localStorage y limpiamos los campos de contraseña
            try {
                localStorage.setItem("nestly_user", JSON.stringify(data.user));
            } catch (e) {}
            setSuccess("Perfil actualizado correctamente ✓");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordSection(false);
        } catch (e) {
            setErrors({ _general: [e.message || "Error desconocido"] });
        } finally {
            setLoading(false);
        }
    }

    // Helper: primer mensaje de error de un campo
    function fieldError(key) {
        return errors[key]?.[0] ?? null;
    }

    return (
        <div className="min-h-screen bg-emerald-50 flex items-start justify-center py-12">
            {/* Botón volver */}
            <button
                type="button"
                onClick={() => onNavigate && onNavigate("home")}
                className="fixed top-4 left-4 px-3 py-1 rounded-md text-sm text-slate-900 border border-black bg-white hover:bg-slate-50 z-50"
            >
                ← Volver
            </button>

            <div className="w-full max-w-md px-4 pt-16">
                <div className="bg-white rounded-xl shadow p-6 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">
                        Editar perfil
                    </h2>

                    {/* ════ SECCIÓN: Datos personales ════ */}
                    <div className="space-y-4">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nombre
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                                    fieldError("name")
                                        ? "border-red-400 bg-red-50"
                                        : "border-slate-200"
                                }`}
                            />
                            {fieldError("name") && (
                                <p className="mt-1 text-xs text-red-500">
                                    {fieldError("name")}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                                    fieldError("email")
                                        ? "border-red-400 bg-red-50"
                                        : "border-slate-200"
                                }`}
                            />
                            {fieldError("email") && (
                                <p className="mt-1 text-xs text-red-500">
                                    {fieldError("email")}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ════ SEPARADOR + TOGGLE CONTRASEÑA ════ */}
                    <div className="border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={togglePasswordSection}
                            className="flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors group"
                        >
                            <span
                                className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-600 text-xs font-bold transition-transform ${showPasswordSection ? "rotate-45" : ""}`}
                            >
                                +
                            </span>
                            {showPasswordSection
                                ? "Cancelar cambio de contraseña"
                                : "Cambiar contraseña"}
                        </button>
                    </div>

                    {/* ════ SECCIÓN: Contraseña (colapsable) ════ */}
                    {showPasswordSection && (
                        <div className="space-y-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                Nueva contraseña
                            </p>

                            {/* Contraseña actual */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Contraseña actual
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                                        fieldError("current_password")
                                            ? "border-red-400 bg-red-50"
                                            : "border-slate-200 bg-white"
                                    }`}
                                />
                                {fieldError("current_password") && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {fieldError("current_password")}
                                    </p>
                                )}
                            </div>

                            {/* Nueva contraseña */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nueva contraseña
                                    <span className="ml-1 text-xs text-slate-400 font-normal">
                                        (mínimo 8 caracteres)
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    autoComplete="new-password"
                                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                                        fieldError("new_password")
                                            ? "border-red-400 bg-red-50"
                                            : "border-slate-200 bg-white"
                                    }`}
                                />
                                {fieldError("new_password") && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {fieldError("new_password")}
                                    </p>
                                )}
                            </div>

                            {/* Confirmar nueva contraseña */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Confirmar nueva contraseña
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    autoComplete="new-password"
                                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                                        fieldError("new_password_confirmation")
                                            ? "border-red-400 bg-red-50"
                                            : "border-slate-200 bg-white"
                                    }`}
                                />
                                {fieldError("new_password_confirmation") && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {fieldError(
                                            "new_password_confirmation",
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════ MENSAJES GLOBALES ════ */}
                    {fieldError("_general") && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {fieldError("_general")}
                        </div>
                    )}
                    {success && (
                        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium">
                            {success}
                        </div>
                    )}

                    {/* ════ ACCIONES ════ */}
                    <div className="flex gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate && onNavigate("home")}
                            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
