from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import AdminUserDep
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


def _no_encontrado(e: Exception) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(max_length=100)] = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e) from e


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(datos: ProductoCreate, _admin: AdminUserDep, service: ServiceDep):
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as e:
        raise _no_encontrado(e) from e


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int, datos: ProductoUpdate, _admin: AdminUserDep, service: ServiceDep
):
    try:
        return service.actualizar(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise _no_encontrado(e) from e


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int, datos: ProductoStockUpdate, _admin: AdminUserDep, service: ServiceDep
):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e) from e


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, _admin: AdminUserDep, service: ServiceDep):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
