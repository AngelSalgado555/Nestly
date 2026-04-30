import "./bootstrap";
import "../css/app.css";

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import ModeApp from "./Components/ModeViews";
import Landing from "./Components/Landing";
import Login from "./Components/Login";
import Register from "./Components/Register";

function MainApp() {
    const [view, setView] = useState("landing"); // 'landing' | 'login' | 'register' | 'home'
    const goTo = (v) => setView(v);

    return (
        <>
            {view === "landing" && <Landing onNavigate={goTo} />}
            {view === "login" && <Login onNavigate={goTo} />}
            {view === "register" && <Register onNavigate={goTo} />}
            {view === "home" && <ModeApp />}
        </>
    );
}

console.log("Nestly React app starting");
const rootElement = document.getElementById("app");
if (rootElement) {
    try {
        createRoot(rootElement).render(<MainApp />);
        console.log("Nestly React app mounted");
    } catch (e) {
        console.error("Error mounting React app", e);
    }
} else {
    console.warn("Root element #app not found");
}
