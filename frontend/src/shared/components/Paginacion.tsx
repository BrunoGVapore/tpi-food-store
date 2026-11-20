import { Button } from "@/shared/ui/Button";

interface PaginacionProps {
    pagina: number; // empieza en 0
    totalPaginas: number;
    onCambiar: (pagina: number) => void;
    deshabilitado?: boolean;
}

export function Paginacion({ pagina, totalPaginas, onCambiar, deshabilitado = false }: PaginacionProps) {
    if (totalPaginas <= 1) return null;
    return (
        <nav className="flex items-center justify-center gap-3" aria-label="Paginación">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onCambiar(pagina - 1)}
                disabled={deshabilitado || pagina === 0}
            >
                ← Anterior
            </Button>
            <span className="text-sm text-stone-600">
                Página {pagina + 1} de {totalPaginas}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onCambiar(pagina + 1)}
                disabled={deshabilitado || pagina >= totalPaginas - 1}
            >
                Siguiente →
            </Button>
        </nav>
    );
}
