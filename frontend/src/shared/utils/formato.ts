const formateadorPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
});

const formateadorFecha = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
});

export function formatearPrecio(valor: number): string {
    return formateadorPrecio.format(valor);
}

export function formatearFecha(iso: string): string {
    return formateadorFecha.format(new Date(iso));
}
