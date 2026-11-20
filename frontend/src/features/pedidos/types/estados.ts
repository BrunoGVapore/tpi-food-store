import type { EstadoPedido, FormaPago } from "./pedido";

export const ESTADOS: EstadoPedido[] = ["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"];

export const NOMBRE_ESTADO: Record<EstadoPedido, string> = {
    PENDIENTE: "Pendiente",
    EN_PREPARACION: "En preparación",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};

export const NOMBRE_FORMA_PAGO: Record<FormaPago, string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
};

// Mismo mapa de transiciones que el backend (RN-02). Solo decide qué botones mostrar:
// la validación real la hace el servidor.
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
    PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
    EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
    ENTREGADO: [],
    CANCELADO: [],
};

export const ACCION_ESTADO: Record<EstadoPedido, string> = {
    PENDIENTE: "Volver a pendiente",
    EN_PREPARACION: "Preparar",
    ENTREGADO: "Entregar",
    CANCELADO: "Cancelar",
};
