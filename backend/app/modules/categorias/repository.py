from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        # Incluye las dadas de baja: la baja lógica no libera el nombre único.
        statement = select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        return self.session.exec(statement).first()

    def list_activas(self) -> list[Categoria]:
        statement = (
            select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        )
        return list(self.session.exec(statement).all())
