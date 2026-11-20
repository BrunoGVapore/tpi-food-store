import type { ReactNode } from "react";

interface EstadoVacioProps {
    titulo: string;
    descripcion?: string;
    accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
    return (
        <div className="panel flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="text-4xl" aria-hidden="true">
                🍽️
            </div>
            <h3 className="text-lg font-semibold text-stone-800">{titulo}</h3>
            {descripcion && <p className="max-w-md text-sm text-stone-500">{descripcion}</p>}
            {accion}
        </div>
    );
}
