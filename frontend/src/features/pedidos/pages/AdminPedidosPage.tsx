import { useCallback, useState } from "react";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { Select } from "@/shared/ui/Input";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { PedidosTable } from "../components/PedidosTable";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { ESTADOS, NOMBRE_ESTADO } from "../types/estados";
import type { EstadoPedido, Pedido } from "../types/pedido";

export function AdminPedidosPage() {
    const [estado, setEstado] = useState<EstadoPedido | "">("");
    const [detalleId, setDetalleId] = useState<number | null>(null);

    // Filtro por estado en el servidor; paginación en el cliente (hasta 100 pedidos).
    const { data, isPending, isError, error, refetch } = usePedidos({
        skip: 0,
        limit: 100,
        estado: estado || undefined,
    });
    const { mutate: cambiarEstado, isPending: procesando } = useCambiarEstadoPedido();

    const verDetalle = useCallback((pedido: Pedido) => setDetalleId(pedido.id), []);
    const handleCambiarEstado = useCallback(
        (pedido: Pedido, destino: EstadoPedido) => {
            if (
                destino === "CANCELADO" &&
                !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se restituye el stock de sus productos.`)
            ) {
                return;
            }
            cambiarEstado({ id: pedido.id, estado: destino });
        },
        [cambiarEstado]
    );

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-stone-800">
                    Pedidos {data && <span className="text-sm font-normal text-stone-500">({data.total})</span>}
                </h2>
                <Select
                    aria-label="Filtrar por estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoPedido | "")}
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
                <SkeletonFilas />
            ) : isError || !data ? (
                <EstadoError mensaje={error?.message ?? "No se pudieron cargar los pedidos"} onReintentar={() => refetch()} />
            ) : data.items.length === 0 ? (
                <EstadoVacio titulo="No hay pedidos" descripcion={estado ? "No hay pedidos con ese estado." : undefined} />
            ) : (
                <PedidosTable
                    key={estado}
                    pedidos={data.items}
                    procesando={procesando}
                    onVerDetalle={verDetalle}
                    onCambiarEstado={handleCambiarEstado}
                />
            )}

            {detalleId !== null && <PedidoDetalleModal pedidoId={detalleId} onClose={() => setDetalleId(null)} />}
        </section>
    );
}
