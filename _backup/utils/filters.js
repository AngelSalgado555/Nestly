const pisosFiltrados = (properties || []).filter((p) => {
    
    let cumpleTexto = true;
    if (filters && filters.busqueda) {
        const textoBuscado = filters.busqueda.toLowerCase();
        const tituloPiso = p.title ? p.title.toLowerCase() : "";
        const ubicacionPiso = p.location ? p.location.toLowerCase() : "";

        const enTitulo = tituloPiso.includes(textoBuscado);
        const enUbicacion = ubicacionPiso.includes(textoBuscado);

        if (!enTitulo && !enUbicacion) {
            cumpleTexto = false;
        }
    }

    let cumplePrecio = true;
    if (filters && filters.precioMax) {
        const precioMax = Number(p.price_eur || p.price || 0);
        const precioMaxUsuario = Number(filters.precioMax);
        if (precioMax > precioMaxUsuario) {
            cumplePrecio = false;
        }
    }

    let cumpleHabitaciones = true;
    if (filters && filters.habitaciones) {
        const habitacionesPiso = Number(p.rooms || 0);
        const habitacionesPisoUsuario = Number(filters.habitaciones);

        if (habitacionesPiso > habitacionesPisoUsuario) {
            cumpleHabitaciones = false;
        }
    }

    return cumpleTexto && cumplePrecio && cumpleHabitaciones;
});