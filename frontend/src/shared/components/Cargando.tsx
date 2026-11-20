export function Cargando({ mensaje = "Cargando..." }: { mensaje?: string }) {
    return (
        <div className="flex items-center justify-center gap-3 py-16 text-stone-500" aria-busy="true">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-brand" />
            <span className="text-sm">{mensaje}</span>
        </div>
    );
}
