/** Devuelve true solo si la URL parece una imagen real (tiene extensión de imagen) */
function isValidImageUrl(url) {
    return (
        Boolean(url) &&
        typeof url === "string" &&
        /\.(jpe?g|png|gif|webp|bmp|svg)(\?|#|$)/i.test(url)
    );
}