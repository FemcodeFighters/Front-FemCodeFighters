// Convierte un texto SVG en una textura de Phaser. Es la única forma de hacerlo en el proyecto.
// - Si la textura ya existe, no hace nada (salvo que se pida replace: true).
// - Devuelve una promesa: true cuando la textura está lista, false si el SVG falló.
export function addSvgTexture(scene, key, svgString, { replace = false } = {}) {
    return new Promise((resolve) => {
        if (scene.textures.exists(key)) {
            if (!replace) {
                resolve(true);
                return;
            }
            scene.textures.remove(key);
        }
        const url = URL.createObjectURL(
            new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }),
        );
        const img = new Image();
        img.onload = () => {
            if (!scene.textures.exists(key)) scene.textures.addImage(key, img);
            URL.revokeObjectURL(url);
            resolve(true);
        };
        img.onerror = () => {
            console.error("No se pudo cargar el SVG de la textura:", key);
            URL.revokeObjectURL(url);
            resolve(false);
        };
        img.src = url;
    });
}