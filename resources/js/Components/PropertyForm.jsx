import React from "react";

// Añadimos "property" a los argumentos para recibir los datos del piso al editar
export default function PropertyForm({ property, onPublished }) {
    const [title, setTitle] = React.useState(property?.title || "");
    const [description, setDescription] = React.useState(property?.description || "");
    const [location, setLocation] = React.useState(property?.location || "");
    const [price, setPrice] = React.useState(property?.price_eur || property?.price || "");
    const [rooms, setRooms] = React.useState(property?.rooms || "");
    const [bathrooms, setBathrooms] = React.useState(property?.bathrooms || "");
    const [area, setArea] = React.useState(property?.area || "");
    
    const [files, setFiles] = React.useState([]); // array of File
    const [previews, setPreviews] = React.useState([]); // array of {file, url}
    
    // Almacena los IDs de las imágenes existentes que el usuario quiere eliminar
    const [imagesToDelete, setImagesToDelete] = React.useState([]);
    // Inicializamos las imágenes existentes con las que ya trae la propiedad si estamos editando
    const [existingImages, setExistingImages] = React.useState(property?.images || []);

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);

    const inputRef = React.useRef(null);
    const MAX_FILES = 10;

    // Sincronizar el estado si cambia la propiedad seleccionada para editar
    React.useEffect(() => {
        if (property) {
            setTitle(property.title || "");
            setDescription(property.description || "");
            setLocation(property.location || "");
            setPrice(property.price_eur || property.price || "");
            setRooms(property.rooms || "");
            setBathrooms(property.bathrooms || "");
            setArea(property.area || "");
            // 🔥 Sincronizamos correctamente las imágenes existentes al cambiar de propiedad
            setExistingImages(property.images || []);
            setImagesToDelete([]); // Limpiamos la papelera al cambiar de piso
        } else {
            // Si no hay propiedad (modo crear), nos aseguramos de que empiece vacío
            setExistingImages([]);
            setImagesToDelete([]);
        }
    }, [property]);

    // Create object URLs for previews when files change
    React.useEffect(() => {
        return () => {
            previews.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [previews]);

    function handleFiles(e) {
        const list = Array.from(e.target.files || []);
        if (!list.length) return;
        const newFiles = [...files, ...list].slice(0, MAX_FILES);

        const newPreviews = newFiles.map((f) => ({
            file: f,
            url: URL.createObjectURL(f),
        }));

        previews.forEach((p) => URL.revokeObjectURL(p.url));

        setFiles(newFiles);
        setPreviews(newPreviews);

        if (inputRef.current) inputRef.current.value = null;
    }

    function openFileDialog() {
        if (inputRef.current) inputRef.current.click();
    }

    function removeFile(idx) {
        const newFiles = files.slice();
        newFiles.splice(idx, 1);
        const newPreviews = previews.slice();
        const removedPreview = newPreviews.splice(idx, 1)[0];
        if (removedPreview) URL.revokeObjectURL(removedPreview.url);
        setFiles(newFiles);
        setPreviews(newPreviews);
    }

    // 🔥 Modificamos la función para que guarde el ID y además la quite de la vista actual
    function handleMarkAsDeleted(imageId) {
        setImagesToDelete((prev) => [...prev, imageId]);
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("location", location);
            if (price !== "") formData.append("price", price);
            if (rooms !== "") formData.append("rooms", rooms);
            if (bathrooms !== "") formData.append("bathrooms", bathrooms);
            if (area !== "") formData.append("area", area);

            // 🚀 ENVIAMOS LOS IDS DE LAS FOTOS A BORRAR COMO JSON
            if (imagesToDelete.length > 0) {
                formData.append("delete_images", JSON.stringify(imagesToDelete));
            }

            // Si estamos editando, simulamos un método PUT en Laravel usando FormData
            if (property?.id) {
                formData.append("_method", "PUT");
            }

            // append files nuevos
            files.forEach((f) => {
                formData.append("images[]", f);
            });

            // Si hay property.id vamos a la ruta de actualizar, si no a la de crear
            const url = property?.id ? `/properties/${property.id}` : "/properties";

            const res = await fetch(url, {
                method: "POST", // Mantenemos POST debido al envío de ficheros binarios
                headers: {
                    "X-CSRF-TOKEN": csrfToken || "",
                },
                credentials: "same-origin",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 422 && data.errors) {
                    const messages = [];
                    Object.keys(data.errors).forEach((k) => {
                        if (Array.isArray(data.errors[k])) {
                            messages.push(...data.errors[k]);
                        }
                    });
                    throw new Error(messages.join(" | ") || "Error al procesar la propiedad");
                }
                throw new Error(data.message || `Error ${res.status}`);
            }

            const data = await res.json();
            setSuccess(property?.id ? "Propiedad actualizada" : "Propiedad publicada");

            // Solo limpiamos los inputs si es una publicación NUEVA
            if (!property?.id) {
                previews.forEach((p) => URL.revokeObjectURL(p.url));
                setTitle("");
                setDescription("");
                setLocation("");
                setPrice("");
                setRooms("");
                setBathrooms("");
                setArea("");
                setFiles([]);
                setPreviews([]);
                setExistingImages([]);
            }
            
            setImagesToDelete([]);

            if (onPublished) onPublished(data);
        } catch (e) {
            setError(e.message || "Error desconocido");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(null), 3000);
        }
    }

    return (
        <form
            className="space-y-4"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
        >
            <div>
                <label className="block text-sm text-slate-700 mb-1">Título</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm text-slate-700 mb-1">Descripción</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                    rows={4}
                />
            </div>

            <div>
                <label className="block text-sm text-slate-700 mb-1">Ubicación</label>
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-slate-700 mb-1">Precio (€)</label>
                    <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-3 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-700 mb-1">Habitaciones</label>
                    <input
                        value={rooms}
                        onChange={(e) => setRooms(e.target.value)}
                        type="number"
                        className="w-full px-4 py-3 border rounded-lg"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-slate-700 mb-1">Baños</label>
                    <input
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        type="number"
                        className="w-full px-4 py-3 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-700 mb-1">Área (m²)</label>
                    <input
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        type="number"
                        className="w-full px-4 py-3 border rounded-lg"
                    />
                </div>
            </div>

            {/* SECCIÓN DE IMÁGENES INTEGRADA Y CORREGIDA */}
            <div>
                <label className="block text-sm text-slate-700 mb-1">
                    Imágenes de la propiedad (máx {MAX_FILES})
                </label>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFiles}
                    className="hidden"
                    aria-hidden="true"
                />

                <div className="flex items-center gap-3 mb-4">
                    <button
                        type="button"
                        onClick={openFileDialog}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m8 0H8" />
                        </svg>
                        <span>Seleccionar imágenes nuevas</span>
                    </button>
                    <div className="text-sm text-slate-600">
                        {files.length} / {MAX_FILES} nuevas seleccionadas
                    </div>
                </div>

                {/* 📸 CORRECCIÓN AQUÍ: Ahora recorremos el estado reactivo 'existingImages' */}
                {existingImages && existingImages.length > 0 && (
                    <div className="mb-4">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Fotos guardadas en la base de datos:
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            {existingImages.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded overflow-hidden border bg-white shadow-sm">
                                    <img src={img.url} alt="Galeria" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleMarkAsDeleted(img.id)}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs font-bold transition-colors shadow-md"
                                        title="Marcar para eliminar"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        {imagesToDelete.length > 0 && (
                            <p className="text-xs text-red-500 mt-1 italic">
                                * {imagesToDelete.length} foto(s) se borrarán al guardar los cambios.
                            </p>
                        )}
                    </div>
                )}

                {/* PREVIEWS DE LAS NUEVAS IMÁGENES SELECCIONADAS */}
                {previews.length > 0 && (
                    <div>
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Nuevas fotos por añadir:
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                            {previews.map((p, i) => (
                                <div key={i} className="relative border rounded overflow-hidden bg-white shadow-sm">
                                    <img src={p.url} alt={p.file.name} className="w-full h-24 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-red-600 hover:bg-white shadow"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
            {success && <div className="text-green-600 text-sm font-medium">{success}</div>}

            <div className="flex gap-3 mt-4 pt-2 border-t">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow transition-colors"
                >
                    {loading ? "Guardando..." : property?.id ? "Guardar Cambios" : "Publicar propiedad"}
                </button>
            </div>
        </form>
    );
}