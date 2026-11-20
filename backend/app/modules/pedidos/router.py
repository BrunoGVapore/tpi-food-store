from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import AdminUserDep, CurrentUserDep
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]

ERRORES_DE_DOMINIO = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


def _traducir(e: Exception) -> HTTPException:
    """Excepción de dominio -> HTTPException con el código de la especificación."""
    if isinstance(e, (PedidoNoEncontrado, ProductoNoEncontrado)):
        codigo = status.HTTP_404_NOT_FOUND
    elif isinstance(e, PedidoAjeno):
        codigo = status.HTTP_403_FORBIDDEN
    else:  # StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida...
        codigo = status.HTTP_400_BAD_REQUEST
    return HTTPException(status_code=codigo, detail=str(e))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(datos: PedidoCreate, usuario: CurrentUserDep, service: ServiceDep):
    try:
        return service.crear(datos, usuario)
    except ERRORES_DE_DOMINIO as e:
        raise _traducir(e) from e


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: CurrentUserDep,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(usuario, skip, limit, estado)


# Se declara antes de /{pedido_id} para que "resumen" no se interprete como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminUserDep, service: ServiceDep):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: CurrentUserDep, service: ServiceDep):
    try:
        return service.obtener(pedido_id, usuario)
    except ERRORES_DE_DOMINIO as e:
        raise _traducir(e) from e


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    pedido_id: int, datos: CambioEstado, _admin: AdminUserDep, service: ServiceDep
):
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except ERRORES_DE_DOMINIO as e:
        raise _traducir(e) from e


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: CurrentUserDep, service: ServiceDep):
    try:
        return service.cancelar(pedido_id, usuario)
    except ERRORES_DE_DOMINIO as e:
        raise _traducir(e) from e
