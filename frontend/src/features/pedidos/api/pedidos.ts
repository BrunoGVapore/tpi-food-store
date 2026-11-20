import { api } from "@/shared/api/axiosInstance";
import { handleApiError } from "@/shared/api/handleApiError";
import type {
    EstadoPedido,
    FiltrosPedidos,
    Pedido,
    PedidoInput,
    PedidosPaginados,
    ResumenPedidos,
} from "../types/pedido";

export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
    try {
        const { data } = await api.get<PedidosPaginados>("/pedidos", { params: filtros });
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudieron cargar los pedidos"), { cause: error });
    }
}

export async function obtenerPedido(id: number): Promise<Pedido> {
    try {
        const { data } = await api.get<Pedido>(`/pedidos/${id}`);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo cargar el pedido"), { cause: error });
    }
}

export async function crearPedido(datos: PedidoInput): Promise<Pedido> {
    try {
        const { data } = await api.post<Pedido>("/pedidos", datos);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo confirmar el pedido"), { cause: error });
    }
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
    try {
        const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo cambiar el estado"), { cause: error });
    }
}

export async function cancelarPedido(id: number): Promise<Pedido> {
    try {
        const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo cancelar el pedido"), { cause: error });
    }
}

export async function obtenerResumen(): Promise<ResumenPedidos> {
    try {
        const { data } = await api.get<ResumenPedidos>("/pedidos/resumen");
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo cargar el resumen"), { cause: error });
    }
}
