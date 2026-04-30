import React from "react";
import logo from "../../images/Nestly.png";

export default function Login({ onNavigate }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    async function submitLogin() {
        setLoading(true);
        setError(null);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                        const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
                body: JSON.stringify({ email, password }),
                credentials: 'same-origin',
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Error de login');
            }

            const data = await res.json();
            if (data && data.success) {
                onNavigate && onNavigate('home');
            }
        } catch (e) {
            setError(e.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-600 via-emerald-500 to-emerald-200 flex items-center justify-center p-6 relative">
            {/* Overlay suave */}
            <div className="absolute inset-0 bg-slate-800/20 backdrop-blur-[1px]"></div>

            <div className="relative max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
                <img
                    src={logo}
                    alt="Nestly"
                    className="mx-auto mb-4 w-20 h-20 object-contain rounded-full border-2 border-emerald-200 p-1 bg-white"
                />
                <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Iniciar sesión</h2>
                <p className="text-sm text-slate-700 mb-6 text-center">Introduce tus credenciales para acceder a Nestly</p>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submitLogin(); }}>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-900"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-700">
                        <label className="inline-flex items-center gap-2">
                            <input type="checkbox" />
                            <span>Recuérdame</span>
                        </label>
                        <button type="button" className="text-emerald-600 font-medium">¿Olvidaste la contraseña?</button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-700">
                    ¿No tienes cuenta?{' '}
                    <button
                        type="button"
                        className="text-emerald-600 font-medium"
                        onClick={() => onNavigate && onNavigate('register')}
                    >
                        Regístrate
                    </button>
                </div>

                {error && <div className="mt-4 text-red-600 text-sm text-center">{error}</div>}

                <div className="mt-4 text-center">
                    <button
                        type="button"
                        className="px-6 py-3 bg-white hover:bg-gray-100 text-slate-900 font-bold rounded-xl transition-all hover:scale-105 shadow border border-slate-800"
                        onClick={() => onNavigate && onNavigate('landing')}
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
}

