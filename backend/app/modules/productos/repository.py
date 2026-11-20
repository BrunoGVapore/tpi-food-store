from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_for_update(self, producto_id: int) -> Producto | None:
        """Lee el producto bloqueando la fila hasta el commit (evita vender stock dos veces).

        En SQLite el bloqueo se ignora.
        """
        statement = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(statement).first()

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        """Listado paginado de productos activos con búsqueda y filtros."""
        condiciones = [Producto.activo == True]  # noqa: E712
        if search:
            condiciones.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*condiciones)
        ).one()
        statement = (
            select(Producto)
            .where(*condiciones)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(col(Producto.id))
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(statement).all())
