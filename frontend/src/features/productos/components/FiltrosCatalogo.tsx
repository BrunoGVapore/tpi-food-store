import { useCategorias } from "@/features/categorias";
import { Input, Select } from "@/shared/ui/Input";

interface FiltrosCatalogoProps {
    busqueda: string;
    categoriaId: number | null;
    onBusqueda: (valor: string) => void;
    onCategoria: (id: number | null) => void;
}

export function FiltrosCatalogo({ busqueda, categoriaId, onBusqueda, onCategoria }: FiltrosCatalogoProps) {
    const { data: categorias = [] } = useCategorias();

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true">
                    🔍
                </span>
                <Input
                    type="search"
                    aria-label="Buscar productos"
                    placeholder="Buscar por nombre..."
                    value={busqueda}
                    onChange={(e) => onBusqueda(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select
                aria-label="Filtrar por categoría"
                value={categoriaId ?? ""}
                onChange={(e) => onCategoria(e.target.value ? Number(e.target.value) : null)}
                className="sm:w-60"
            >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nombre}
                    </option>
                ))}
            </Select>
        </div>
    );
}
