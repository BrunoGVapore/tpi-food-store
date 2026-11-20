// API pública de la feature pedidos (incluye carrito y checkout).
export { CarritoPage } from "./pages/CarritoPage";
export { CheckoutPage } from "./pages/CheckoutPage";
export { MisPedidosPage } from "./pages/MisPedidosPage";
export { AdminPedidosPage } from "./pages/AdminPedidosPage";
export { AdminResumenPage } from "./pages/AdminResumenPage";
export {
    useCambiarEstadoPedido,
    useCancelarPedido,
    useCrearPedido,
    usePedido,
    usePedidos,
    useResumenPedidos,
} from "./hooks/usePedidos";
export type { DetallePedido, EstadoPedido, Pedido, ResumenPedidos } from "./types/pedido";
