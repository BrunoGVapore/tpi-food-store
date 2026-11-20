import { useState } from "react";

interface ProductoImagenProps {
    url: string | null;
    nombre: string;
    className?: string;
}

// Muestra la imagen del producto o, si no tiene (o no carga), un fondo con la inicial.
export function ProductoImagen({ url, nombre, className = "" }: ProductoImagenProps) {
    const [fallo, setFallo] = useState(false);

    if (!url || fallo) {
        return (
            <div
                className={`flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-200 font-extrabold text-orange-700/70 ${className}`}
                aria-hidden="true"
            >
                {nombre.charAt(0).toUpperCase()}
            </div>
        );
    }

    return <img src={url} alt={nombre} loading="lazy" onError={() => setFallo(true)} className={`object-cover ${className}`} />;
}
