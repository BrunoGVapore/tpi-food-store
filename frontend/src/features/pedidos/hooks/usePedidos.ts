import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import {
    cambiarEstadoPedido,
    cancelarPedido,
    crearPedido,
    listarPedidos,
    obtenerPedido,
    obtenerResumen,
} from "../api/pedidos";
import { NOMBRE_ESTADO } from "../types/estados";
import type { EstadoPedido, FiltrosPedidos } from "../types/pedido";

export const PEDIDOS_KEY = ["pedidos"] as const;

// Propios (cliente) o todos (admin): lo decide el backend según la sesión.
export function usePedidos(filtros: FiltrosPedidos) {
    return useQuery({
        queryKey: [...PEDIDOS_KEY, "lista", filtros],
        queryFn: () => listarPedidos(filtros),
        placeholderData: keepPreviousData,
    });
}

export function usePedido(id: number | null) {
    return useQuery({
        queryKey: [...PEDIDOS_KEY, "detalle", id],
        queryFn: () => obtenerPedido(id ?? 0),
        enabled: id !== null,
    });
}

export function useResumenPedidos() {
    return useQuery({ queryKey: [...PEDIDOS_KEY, "resumen"], queryFn: obtenerResumen });
}

// Crear o cancelar un pedido cambia el stock: se invalidan pedidos y productos.
function useInvalidarPedidosYStock() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: PEDIDOS_KEY });
        queryClient.invalidateQueries({ queryKey: ["productos"] });
    };
}

export function useCrearPedido() {
    const invalidar = useInvalidarPedidosYStock();
    return useMutation({ mutationFn: crearPedido, onSuccess: invalidar });
}

export function useCambiarEstadoPedido() {
    const invalidar = useInvalidarPedidosYStock();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
        onSuccess: (pedido) => {
            invalidar();
            const extra = pedido.estado === "CANCELADO" ? " (stock restituido)" : "";
            showNotification(`Pedido #${pedido.id}: ${NOMBRE_ESTADO[pedido.estado]}${extra}`, "success");
        },
        onError: (error: Error) => showNotification(error.message, "error"),
    });
}

export function useCancelarPedido() {
    const invalidar = useInvalidarPedidosYStock();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: cancelarPedido,
        onSuccess: (pedido) => {
            invalidar();
            showNotification(`Pedido #${pedido.id} cancelado`, "success");
        },
        onError: (error: Error) => showNotification(error.message, "error"),
    });
}
