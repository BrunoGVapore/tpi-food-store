interface ResumenCardProps {
    titulo: string;
    valor: string | number;
    icono: string;
    color: string; // clases de fondo y texto del ícono
}

export function ResumenCard({ titulo, valor, icono, color }: ResumenCardProps) {
    return (
        <div className="panel flex items-center gap-4 p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${color}`} aria-hidden="true">
                {icono}
            </div>
            <div>
                <p className="text-sm text-stone-500">{titulo}</p>
                <p className="text-2xl font-extrabold text-stone-900">{valor}</p>
            </div>
        </div>
    );
}
