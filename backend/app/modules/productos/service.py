from typing import Any

from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    """404: el producto no existe o está dado de baja."""


# Campos que no admiten null aunque el schema de actualización sea opcional.
_CAMPOS_OBLIGATORIOS = {"nombre", "precio_base", "stock", "disponible", "categoria_id"}


def _sin_nulos_obligatorios(cambios: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in cambios.items() if not (k in _CAMPOS_OBLIGATORIOS and v is None)}


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._get_activo(uow, producto_id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, datos.categoria_id)
            producto = uow.productos.add(Producto.model_validate(datos))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            cambios = _sin_nulos_obligatorios(datos.model_dump(exclude_unset=True))
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            uow.session.refresh(producto)  # recarga la relación categoria si cambió
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            producto.sqlmodel_update(_sin_nulos_obligatorios(datos.model_dump(exclude_unset=True)))
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)

    @staticmethod
    def _get_activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(f"Producto con id {producto_id} no encontrado")
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"Categoría con id {categoria_id} no encontrada")
