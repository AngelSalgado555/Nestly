import "./bootstrap";
import "../css/app.css";

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import ModeApp from "./Components/ModeViews";
import Landing from "./Components/Landing";
import Login from "./Components/Login";
import Register from "./Components/Register";
import EditProfile from "./Components/EditProfile";

function MainApp() {
    // Robustly read view from localStorage with fallback
    function readStoredView() {
        try {
            const v = localStorage.getItem("nestly_view");
            return v ?? "landing";
        } catch (e) {
            return "landing";
        }
    }

    const initialView = readStoredView();
    const [view, setView] = useState(initialView); // 'landing' | 'login' | 'register' | 'home'

    // goTo updates state AND persists into localStorage
    const goTo = (v) => {
        setView(v);
        try {
            localStorage.setItem("nestly_view", v);
        } catch (e) {
            // ignore storage errors (e.g., private mode)
        }
    };

    React.useEffect(() => {
        // On mount, try to parse stored user safely
        let storedUser = null;
        try {
            const raw = localStorage.getItem("nestly_user");
            if (raw) {
                storedUser = JSON.parse(raw);
            }
        } catch (e) {
            // corrupted JSON: remove it to avoid breaking the app
            try {
                localStorage.removeItem("nestly_user");
            } catch (_) {}
            storedUser = null;
        }

        const storedView = readStoredView();

        if (!storedUser && storedView === "home") {
            // no user but view says home -> force to landing
            goTo("landing");
            return;
        }

        if (
            storedUser &&
            (storedView === "landing" ||
                storedView === "login" ||
                storedView === "register")
        ) {
            // user logged in but view is pre-auth -> go to home
            goTo("home");
            return;
        }

        // otherwise keep the stored or default view
    }, []);

    return (
        <>
            {view === "landing" && <Landing onNavigate={goTo} />}
            {view === "login" && <Login onNavigate={goTo} />}
            {view === "register" && <Register onNavigate={goTo} />}
            {view === "profile" && <EditProfile onNavigate={goTo} />}
            {view === "home" && <ModeApp onNavigate={goTo} />}
        </>
    );
}

const rootElement = document.getElementById("app");
if (rootElement) {
    // Create a single root and reuse it across HMR updates.
    // Store it on window to avoid multiple createRoot calls which cause the React warning.
    if (!window.__NESTLY_ROOT) {
        window.__NESTLY_ROOT = createRoot(rootElement);
    }

    window.__NESTLY_ROOT.render(<MainApp />);
}

// Handle Vite HMR: unmount on dispose so the root can be recreated cleanly
if (import.meta && import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
        if (window.__NESTLY_ROOT) {
            try {
                window.__NESTLY_ROOT.unmount();
            } catch (e) {
                // ignore
            }
            delete window.__NESTLY_ROOT;
        }
    });
}
