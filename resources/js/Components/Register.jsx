import React from "react";
import logo from "../../images/Nestly.png";

export default function Register({ onNavigate }) {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [passwordError, setPasswordError] = React.useState(null);
    const [passwordConfirmError, setPasswordConfirmError] =
        React.useState(null);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = React.useState(false);

    function validate() {
        setPasswordError(null);
        setPasswordConfirmError(null);

        if (password.length < 6) {
            setPasswordError("La contraseña debe tener al menos 6 caracteres.");
        }

        if (password !== passwordConfirmation) {
            setPasswordConfirmError("Las contraseñas no coinciden.");
        }

        return (
            !passwordError &&
            !passwordConfirmError &&
            password.length >= 6 &&
            password === passwordConfirmation
        );
    }

    async function submitRegister() {
        setLoading(true);
        setError(null);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");
            const res = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Error al registrar");
            }

            const data = await res.json();
            if (data && data.success) {
                try {
                    localStorage.setItem(
                        "nestly_user",
                        JSON.stringify(data.user),
                    );
                    localStorage.setItem("nestly_view", "home");
                } catch (e) {
                    // ignore storage errors
                }
                onNavigate("home");
            }
        } catch (e) {
            setError(e.message || "Error desconocido");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-600 via-emerald-500 to-emerald-200 flex items-center justify-center p-6 pt-16 relative">
            <div className="absolute inset-0 bg-slate-800/20 backdrop-blur-[1px]"></div>
            <div className="relative max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
                <img
                    src={logo}
                    alt="Nestly"
                    className="mx-auto mb-4 w-20 h-20 object-contain rounded-full border-2 border-emerald-200 p-1 bg-white"
                />
                <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
                    Crear cuenta
                </h2>
                <p className="text-sm text-slate-700 mb-6 text-center">
                    Regístrate para empezar a publicar y gestionar tus inmuebles
                    en Nestly
                </p>

                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!validate()) {
                            setLoading(false);
                            return;
                        }
                        submitRegister();
                    }}
                >
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-700 mb-1">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-700 mb-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (
                                        passwordError &&
                                        e.target.value.length >= 6
                                    )
                                        setPasswordError(null);
                                    if (
                                        passwordConfirmError &&
                                        e.target.value === passwordConfirmation
                                    )
                                        setPasswordConfirmError(null);
                                }}
                                placeholder="Contraseña"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-900 ${passwordError ? "border-red-500" : ""}`}
                            />

                            <button
                                type="button"
                                aria-label={
                                    showPassword
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600"
                            >
                                {showPassword ? (
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M3 3l18 18"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M17.94 17.94C16.22 19.01 14.15 19.66 12 19.66c-6 0-10-7-10-7a17.9 17.9 0 0 1 3.58-4.1"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="3"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="mt-2 text-sm text-red-600">
                                {passwordError}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-slate-700 mb-1">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswordConfirm ? "text" : "password"}
                                value={passwordConfirmation}
                                onChange={(e) => {
                                    setPasswordConfirmation(e.target.value);
                                    if (
                                        passwordConfirmError &&
                                        e.target.value === password
                                    )
                                        setPasswordConfirmError(null);
                                }}
                                placeholder="Repite la contraseña"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-900 ${passwordConfirmError ? "border-red-500" : ""}`}
                            />

                            <button
                                type="button"
                                aria-label={
                                    showPasswordConfirm
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                                onClick={() =>
                                    setShowPasswordConfirm((prev) => !prev)
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600"
                            >
                                {showPasswordConfirm ? (
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M3 3l18 18"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M17.94 17.94C16.22 19.01 14.15 19.66 12 19.66c-6 0-10-7-10-7a17.9 17.9 0 0 1 3.58-4.1"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="3"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {passwordConfirmError && (
                            <p className="mt-2 text-sm text-red-600">
                                {passwordConfirmError}
                            </p>
                        )}
                    </div>

                    <div className="flex items-start gap-3 text-sm text-slate-700">
                        <label className="inline-flex items-center gap-2">
                            <input type="checkbox" className="mt-1" />
                            <span>
                                Acepto los{" "}
                                <button
                                    type="button"
                                    className="text-emerald-600 underline"
                                >
                                    términos y condiciones
                                </button>
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
                        disabled={loading}
                    >
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-700">
                    ¿Ya tienes cuenta?{" "}
                    <button
                        type="button"
                        className="text-emerald-600 font-medium"
                        onClick={() => onNavigate && onNavigate("login")}
                    >
                        Iniciar sesión
                    </button>
                </div>

                {error && (
                    <div className="mt-4 text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="mt-4 text-center">
                    <button
                        type="button"
                        className="px-6 py-3 bg-white hover:bg-gray-100 text-slate-900 font-bold rounded-xl transition-all hover:scale-105 shadow border border-slate-800"
                        onClick={() => onNavigate && onNavigate("landing")}
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
}
