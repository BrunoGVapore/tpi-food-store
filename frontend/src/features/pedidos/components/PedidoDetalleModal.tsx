import { Cargando } from "@/shared/components/Cargando";
import { EstadoError } from "@/shared/components/EstadoError";
import { Modal } from "@/shared/ui/Modal";
import { usePedido } from "../hooks/usePedidos";
import { PedidoDetalle } from "./PedidoDetalle";

interface PedidoDetalleModalProps {
    pedidoId: number;
    onClose: () => void;
}

// Pide el detalle con GET /pedidos/{id} (dueño o admin).
export function PedidoDetalleModal({ pedidoId, onClose }: PedidoDetalleModalProps) {
    const { data: pedido, isPending, isError, error, refetch } = usePedido(pedidoId);

    return (
        <Modal title={`Pedido #${pedidoId}`} onClose={onClose} wide>
            {isPending ? (
                <Cargando mensaje="Cargando pedido..." />
            ) : isError || !pedido ? (
                <EstadoError mensaje={error?.message ?? "No se pudo cargar el pedido"} onReintentar={() => refetch()} />
            ) : (
                <PedidoDetalle pedido={pedido} />
            )}
        </Modal>
    );
}
