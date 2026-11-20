import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { Select } from "@/shared/ui/Input";
import { PedidoCard } from "../components/PedidoCard";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import { ESTADOS, NOMBRE_ESTADO } from "../types/estados";
import type { EstadoPedido, Pedido } from "../types/pedido";

const POR_PAGINA = 5;

export function MisPedidosPage() {
    const [pagina, setPagina] = useState(0);
    const [estado, setEstado] = useState<EstadoPedido | "">("");
    const [detalleId, setDetalleId] = useState<number | null>(null);

    const { data, isPending, isError, error, refetch } = usePedidos({
        skip: pagina * POR_PAGINA,
        limit: POR_PAGINA,
        estado: estado || undefined,
    });
    const { mutate: cancelar, isPending: cancelando } = useCancelarPedido();

    const verDetalle = useCallback((pedido: Pedido) => setDetalleId(pedido.id), []);
    const handleCancelar = useCallback(
        (pedido: Pedido) => {
            if (window.confirm(`¿Cancelar el pedido #${pedido.id}? El stock se devuelve al negocio.`)) {
                cancelar(pedido.id);
            }
        },
        [cancelar]
    );

    const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="page-title">Mis pedidos</h1>
                <Select
                    aria-label="Filtrar por estado"
                    value={estado}
                    onChange={(e) => {
                        setEstado(e.target.value as EstadoPedido | "");
                        setPagina(0);
                    }}
                    className="w-56"
                >
                    <option value="">Todos los estados</option>
                    {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                            {NOMBRE_ESTADO[e]}
                        </option>
                    ))}
                </Select>
            </div>

            {isPending ? (
                <SkeletonFilas cantidad={3} />
            ) : isError || !data ? (
                <EstadoError mensaje={error?.message ?? "No se pudieron cargar tus pedidos"} onReintentar={() => refetch()} />
            ) : data.items.length === 0 ? (
                <EstadoVacio
                    titulo={estado ? "No hay pedidos con ese estado" : "Todavía no hiciste pedidos"}
                    descripcion={estado ? "Probá con otro filtro." : "Cuando confirmes tu primer pedido lo vas a ver acá."}
                    accion={
                        estado ? undefined : (
                            <Link to="/" className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover">
                                Ir al catálogo
                            </Link>
                        )
                    }
                />
            ) : (
                <>
                    <div className="space-y-3">
                        {data.items.map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                onVerDetalle={verDetalle}
                                onCancelar={handleCancelar}
                                cancelando={cancelando}
                            />
                        ))}
                    </div>
                    <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
                </>
            )}

            {detalleId !== null && <PedidoDetalleModal pedidoId={detalleId} onClose={() => setDetalleId(null)} />}
        </div>
    );
}
