import { useState } from "react";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonGrilla } from "@/shared/components/Skeleton";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Button } from "@/shared/ui/Button";
import { FiltrosCatalogo } from "../components/FiltrosCatalogo";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const POR_PAGINA = 8;

export function CatalogoPage() {
    const [pagina, setPagina] = useState(0);
    const [busqueda, setBusqueda] = useState("");
    const [categoriaId, setCategoriaId] = useState<number | null>(null);
    const busquedaDebounced = useDebounce(busqueda.trim());

    // Paginación en el servidor: skip = página × limit.
    const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductos({
        skip: pagina * POR_PAGINA,
        limit: POR_PAGINA,
        search: busquedaDebounced || undefined,
        categoria_id: categoriaId ?? undefined,
    });

    const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0;
    const hayFiltros = busqueda !== "" || categoriaId !== null;

    // Al cambiar un filtro se vuelve a la primera página.
    const cambiarBusqueda = (valor: string) => {
        setBusqueda(valor);
        setPagina(0);
    };
    const cambiarCategoria = (id: number | null) => {
        setCategoriaId(id);
        setPagina(0);
    };
    const limpiarFiltros = () => {
        setBusqueda("");
        setCategoriaId(null);
        setPagina(0);
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-8 text-white shadow-sm sm:px-10">
                <h1 className="text-3xl font-extrabold">¿Qué vas a comer hoy?</h1>
                <p className="mt-2 max-w-xl text-orange-50">
                    Elegí tus platos, armá el carrito y recibí el pedido en tu casa. Pagás en efectivo o por transferencia.
                </p>
            </section>

            <FiltrosCatalogo
                busqueda={busqueda}
                categoriaId={categoriaId}
                onBusqueda={cambiarBusqueda}
                onCategoria={cambiarCategoria}
            />

            {isPending ? (
                <SkeletonGrilla cantidad={POR_PAGINA} />
            ) : isError || !data ? (
                <EstadoError mensaje={error?.message ?? "No se pudo cargar el catálogo"} onReintentar={() => refetch()} />
            ) : data.items.length === 0 ? (
                <EstadoVacio
                    titulo="No encontramos productos"
                    descripcion={hayFiltros ? "Probá con otra búsqueda o categoría." : "Todavía no hay productos cargados."}
                    accion={
                        hayFiltros ? (
                            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                                Limpiar filtros
                            </Button>
                        ) : undefined
                    }
                />
            ) : (
                <>
                    <p className="text-sm text-stone-500">
                        {data.total} {data.total === 1 ? "producto" : "productos"}
                    </p>
                    <div
                        className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isPlaceholderData ? "opacity-60" : ""}`}
                    >
                        {data.items.map((producto) => (
                            <ProductoCard key={producto.id} producto={producto} />
                        ))}
                    </div>
                    <Paginacion
                        pagina={pagina}
                        totalPaginas={totalPaginas}
                        onCambiar={setPagina}
                        deshabilitado={isPlaceholderData}
                    />
                </>
            )}
        </div>
    );
}
