from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def _listar(
        self, skip: int, limit: int, estado: str | None, usuario_id: int | None
    ) -> tuple[int, list[Pedido]]:
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*condiciones)
        ).one()
        statement = (
            select(Pedido)
            .where(*condiciones)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(statement).all())

    def list_all(self, skip: int, limit: int, estado: str | None) -> tuple[int, list[Pedido]]:
        return self._listar(skip, limit, estado, usuario_id=None)

    def list_by_usuario(
        self, usuario_id: int, skip: int, limit: int, estado: str | None
    ) -> tuple[int, list[Pedido]]:
        return self._listar(skip, limit, estado, usuario_id=usuario_id)

    def count_by_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return {estado: cantidad for estado, cantidad in self.session.exec(statement).all()}

    def count_desde(self, desde: datetime) -> int:
        statement = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(statement).one()

    def sum_total_by_estado(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(statement).one())
