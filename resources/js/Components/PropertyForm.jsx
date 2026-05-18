import React from "react";

export default function PropertyForm({ onPublished }) {
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [rooms, setRooms] = React.useState("");
    const [bathrooms, setBathrooms] = React.useState("");
    const [area, setArea] = React.useState("");
    const [files, setFiles] = React.useState([]); // array of File
    const [previews, setPreviews] = React.useState([]); // array of {file, url}

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);

    const inputRef = React.useRef(null);
    const MAX_FILES = 10;

    // Create object URLs for previews when files change
    React.useEffect(() => {
        // revoke old urls
        return () => {
            previews.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [previews]);

    function handleFiles(e) {
        const list = Array.from(e.target.files || []);
        if (!list.length) return;
        const newFiles = [...files, ...list].slice(0, MAX_FILES);

        // create previews
        const newPreviews = newFiles.map((f) => ({
            file: f,
            url: URL.createObjectURL(f),
        }));

        // revoke previous preview URLs
        previews.forEach((p) => URL.revokeObjectURL(p.url));

        setFiles(newFiles);
        setPreviews(newPreviews);

        // reset the input element so selecting the same file again works
        if (inputRef.current) inputRef.current.value = null;
    }

    function openFileDialog() {
        if (inputRef.current) inputRef.current.click();
    }

    function removeFile(idx) {
        const newFiles = files.slice();
        const removed = newFiles.splice(idx, 1);
        const newPreviews = previews.slice();
        const removedPreview = newPreviews.splice(idx, 1)[0];
        if (removedPreview) URL.revokeObjectURL(removedPreview.url);
        setFiles(newFiles);
        setPreviews(newPreviews);
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

            // append files
            files.forEach((f) => {
                formData.append("images[]", f);
            });

            const res = await fetch("/properties", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrfToken || "",
                    // IMPORTANT: do NOT set Content-Type when sending FormData
                },
                credentials: "same-origin",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                // handle validation errors (422)
                if (res.status === 422 && data.errors) {
                    // collect first error messages
                    const messages = [];
                    Object.keys(data.errors).forEach((k) => {
                        if (Array.isArray(data.errors[k])) {
                            messages.push(...data.errors[k]);
                        }
                    });
                    throw new Error(
                        messages.join(" | ") ||
                            "Error al publicar la propiedad",
                    );
                }
                throw new Error(data.message || `Error ${res.status}`);
            }

            const data = await res.json();
            setSuccess("Propiedad publicada");

            // reset form and revoke previews
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
                <label className="block text-sm text-slate-700 mb-1">
                    Título
                </label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm text-slate-700 mb-1">
                    Descripción
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                    rows={4}
                />
            </div>

            <div>
                <label className="block text-sm text-slate-700 mb-1">
                    Ubicación
                </label>
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-slate-700 mb-1">
                        Precio (€)
                    </label>
                    <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-3 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-700 mb-1">
                        Habitaciones
                    </label>
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
                    <label className="block text-sm text-slate-700 mb-1">
                        Baños
                    </label>
                    <input
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        type="number"
                        className="w-full px-4 py-3 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-700 mb-1">
                        Área (m²)
                    </label>
                    <input
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        type="number"
                        className="w-full px-4 py-3 border rounded-lg"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-slate-700 mb-1">
                    Imágenes (máx {MAX_FILES}, 5MB cada una)
                </label>

                {/* Hidden native input */}
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFiles}
                    className="hidden"
                    aria-hidden="true"
                />

                {/* Custom visible button */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={openFileDialog}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 transition-colors"
                    >
                        {/* Simple icon (SVG) */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m8 0H8"
                            />
                        </svg>
                        <span>Seleccionar imágenes</span>
                    </button>

                    <div className="text-sm text-slate-600">
                        {files.length} / {MAX_FILES} seleccionadas
                    </div>
                </div>

                {/* Previews */}
                {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                        {previews.map((p, i) => (
                            <div
                                key={i}
                                className="relative border rounded overflow-hidden"
                            >
                                <img
                                    src={p.url}
                                    alt={p.file.name}
                                    className="w-full h-28 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 hover:bg-white"
                                    aria-label={`Eliminar ${p.file.name}`}
                                >
                                    ×
                                </button>
                                <div className="p-1 text-xs text-slate-600 truncate">
                                    {p.file.name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}

            <div className="flex gap-3 mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded"
                >
                    {loading ? "Publicando..." : "Publicar propiedad"}
                </button>
            </div>
        </form>
    );
}
