import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";
import { NOMBRE_FORMA_PAGO } from "../types/estados";
import type { Pedido } from "../types/pedido";

interface PedidoCardProps {
    pedido: Pedido;
    onVerDetalle: (pedido: Pedido) => void;
    onCancelar: (pedido: Pedido) => void;
    cancelando: boolean;
}

export function PedidoCard({ pedido, onVerDetalle, onCancelar, cancelando }: PedidoCardProps) {
    const unidades = pedido.items.reduce((suma, i) => suma + i.cantidad, 0);
    const resumenItems = pedido.items.map((i) => `${i.cantidad}× ${i.nombre_producto}`).join(", ");

    return (
        <article className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-stone-900">Pedido #{pedido.id}</h3>
                    <BadgeEstado estado={pedido.estado} />
                </div>
                <p className="text-sm text-stone-500">
                    {formatearFecha(pedido.created_at)} · {unidades} {unidades === 1 ? "unidad" : "unidades"} ·{" "}
                    {NOMBRE_FORMA_PAGO[pedido.forma_pago]}
                </p>
                <p className="line-clamp-1 text-sm text-stone-600">{resumenItems}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                <span className="text-lg font-extrabold text-stone-900">{formatearPrecio(pedido.total)}</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onVerDetalle(pedido)}>
                        Ver detalle
                    </Button>
                    {pedido.estado === "PENDIENTE" && (
                        <Button variant="danger" size="sm" onClick={() => onCancelar(pedido)} disabled={cancelando}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );
}
