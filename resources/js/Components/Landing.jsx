import React from "react";
import logo from "../../images/Nestly.png";

export default function Landing({ onNavigate }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-600 via-emerald-500 to-emerald-200 flex items-center justify-center p-6 relative">
            {/* Overlay suave para mejorar contraste */}
            <div className="absolute inset-0 bg-slate-800/30 backdrop-blur-[1px]"></div>

            <div className="relative max-w-4xl w-full bg-white border border-slate-200 rounded-3xl p-8 md:p-16 shadow-lg text-center">
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-emerald-800 uppercase bg-emerald-100 rounded-full border border-emerald-200">
                    Tu próximo hogar en la Capital
                </span>

                <img
                    src={logo}
                    alt="Nestly"
                    className="mx-auto mb-4 w-24 h-24 object-contain rounded-full border-2 border-emerald-200 p-1 bg-white/5"
                />

                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                    Nestly
                </h1>

                <p className="text-xl md:text-2xl text-slate-700 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Expertos en conectar personas con su piso ideal. Desde la
                    Gran Vía hasta el Barrio de Salamanca.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button
                        onClick={() => onNavigate && onNavigate("login")}
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow flex items-center justify-center"
                    >
                        Login
                    </button>

                    <button
                        onClick={() => onNavigate && onNavigate("register")}
                        className="px-8 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all hover:scale-105 shadow flex items-center justify-center"
                    >
                        Register
                    </button>
                </div>

                <div className="mt-8"></div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-800 text-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-emerald-600 font-bold text-lg">
                            +500
                        </span>
                        <span>Inmuebles en Madrid</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-emerald-600 font-bold text-lg">
                            0%
                        </span>
                        <span>Comisiones ocultas</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-emerald-600 font-bold text-lg">
                            24h
                        </span>
                        <span>Valoración gratuita</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
