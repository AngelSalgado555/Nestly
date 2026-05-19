import React, { useState, useEffect, useRef } from "react";

export default function Navbar({ modo, setModo, onNavigate }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    async function handleLogout() {
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");
            await fetch("/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                },
                credentials: "same-origin",
            });
        } catch (e) {
            // ignore errors
        }

        try {
            localStorage.removeItem("nestly_user");
            localStorage.removeItem("nestly_view");
            localStorage.removeItem("nestly_mode");
        } catch (e) {}

        if (onNavigate) {
            onNavigate("landing");
        } else {
            window.location.href = "/";
        }
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Read user from localStorage
    let user = null;
    try {
        const raw = localStorage.getItem("nestly_user");
        if (raw) user = JSON.parse(raw);
    } catch (e) {
        user = null;
    }

    const initials =
        user && user.name
            ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
            : "U";
    const displayName = user && user.name ? user.name.split(" ")[0] : "Usuario";

    return (
        <nav className="w-full bg-white/90 backdrop-blur-sm shadow p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
            <div className="font-bold text-lg">Nestly</div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setModo("comprador")}
                    className={`px-4 py-2 rounded ${modo === "comprador" ? "bg-emerald-600 text-white" : "bg-gray-100"}`}
                >
                    Comprador
                </button>
                <button
                    onClick={() => setModo("vendedor")}
                    className={`px-4 py-2 rounded ${modo === "vendedor" ? "bg-emerald-600 text-white" : "bg-gray-100"}`}
                >
                    Vendedor
                </button>
                <button
                    onClick={() => setModo("mis")}
                    className={`px-4 py-2 rounded ${modo === "mis" ? "bg-emerald-600 text-white" : "bg-gray-100"}`}
                >
                    Mis piezas
                </button>

                {/* Profile avatar / dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown((prev) => !prev)}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700 border border-slate-200"
                        aria-haspopup="true"
                        aria-expanded={showDropdown}
                    >
                        {initials}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-slate-200 z-50">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <div className="text-sm text-slate-700">
                                    Hola, {displayName}
                                </div>
                            </div>
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        if (onNavigate) onNavigate("profile");
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50"
                                >
                                    Editar Perfil
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        handleLogout();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
