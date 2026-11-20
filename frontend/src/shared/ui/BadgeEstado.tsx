const estilos: Record<string, { texto: string; clase: string }> = {
    PENDIENTE: { texto: "Pendiente", clase: "bg-amber-100 text-amber-800 ring-amber-200" },
    EN_PREPARACION: { texto: "En preparación", clase: "bg-sky-100 text-sky-800 ring-sky-200" },
    ENTREGADO: { texto: "Entregado", clase: "bg-green-100 text-green-800 ring-green-200" },
    CANCELADO: { texto: "Cancelado", clase: "bg-stone-200 text-stone-700 ring-stone-300" },
};

// Colorea los cuatro estados del pedido.
export function BadgeEstado({ estado }: { estado: string }) {
    const estilo = estilos[estado] ?? { texto: estado, clase: "bg-stone-100 text-stone-700 ring-stone-200" };
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${estilo.clase}`}
        >
            {estilo.texto}
        </span>
    );
}
