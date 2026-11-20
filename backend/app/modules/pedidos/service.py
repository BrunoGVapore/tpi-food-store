from datetime import date, datetime, time

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

# ---------------------------------------------------------------------------
# Excepciones de dominio (el router las traduce a códigos HTTP)
# ---------------------------------------------------------------------------


class PedidoNoEncontrado(Exception):
    """404"""


class PedidoAjeno(Exception):
    """403: el pedido pertenece a otro usuario (RN-04)."""


class ReglaDeNegocio(Exception):
    """400: base de las reglas de negocio que no se cumplen."""


class ProductoRepetido(ReglaDeNegocio):
    """RN-01: un producto no puede repetirse entre los ítems."""


class ProductoNoDisponible(ReglaDeNegocio):
    """RN-01: el producto está marcado como no disponible."""


class StockInsuficiente(ReglaDeNegocio):
    """RN-01: no hay stock suficiente para la cantidad pedida."""


class TransicionInvalida(ReglaDeNegocio):
    """RN-02: la transición no está en el mapa de estados."""


class PedidoNoCancelable(ReglaDeNegocio):
    """RN-04: el cliente solo puede cancelar pedidos en PENDIENTE."""


# RN-02: mapa de transiciones válidas. ENTREGADO y CANCELADO son terminales.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    # ---------------------------------------------------------------- RN-01
    def crear(self, datos: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        """Crea el pedido en una sola transacción: si algo falla, no se persiste nada."""
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no puede repetirse en el pedido")

            pedido = Pedido(
                usuario_id=usuario.id,
                estado="PENDIENTE",
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in datos.items:
                # Por cada ítem, en la misma iteración: verificar, descontar y crear la línea.
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto con id {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': "
                        f"quedan {producto.stock} y pediste {item.cantidad}"
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia (RN-05)
                        precio_unitario=producto.precio_base,  # copia (RN-05)
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # -------------------------------------------------------------- lecturas
    def listar(
        self, usuario: UserPublic, skip: int, limit: int, estado: EstadoPedido | None
    ) -> PedidosPaginados:
        """El admin ve todos los pedidos; el cliente, solo los propios (RN-04)."""
        with self.uow as uow:
            if usuario.role == "admin":
                total, pedidos = uow.pedidos.list_all(skip, limit, estado)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario.id, skip, limit, estado)
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés ver un pedido de otro usuario")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.combine(date.today(), time.min)
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado("ENTREGADO"), 2),
            )

    # ------------------------------------------------------- RN-02 y RN-03
    def cambiar_estado(self, pedido_id: int, nuevo_estado: EstadoPedido) -> PedidoRead:
        """El admin avanza o cancela según el mapa de transiciones."""
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ------------------------------------------------------- RN-03 y RN-04
    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """El cliente dueño cancela su pedido, solo en PENDIENTE."""
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés cancelar un pedido de otro usuario")
            if pedido.estado != "PENDIENTE":
                raise PedidoNoCancelable(
                    f"Solo se pueden cancelar pedidos en PENDIENTE (estado actual: {pedido.estado})"
                )
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ------------------------------------------------------------ auxiliares
    @staticmethod
    def _get(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(f"Pedido con id {pedido_id} no encontrado")
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve el stock de cada línea en la misma transacción del cambio de estado."""
        for item in pedido.items:
            producto = uow.productos.get_for_update(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)
