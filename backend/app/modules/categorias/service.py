from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """404: la categoría no existe o está dada de baja."""


class NombreDuplicado(Exception):
    """409: ya existe una categoría con ese nombre."""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._get_activa(uow.categorias, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(datos.nombre) is not None:
                raise NombreDuplicado(f"Ya existe una categoría llamada '{datos.nombre}'")
            categoria = uow.categorias.add(Categoria.model_validate(datos))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._get_activa(uow.categorias, categoria_id)
            # Solo los campos enviados; nombre no admite null.
            cambios = datos.model_dump(exclude_unset=True)
            if cambios.get("nombre", "") is None:
                cambios.pop("nombre")
            nuevo_nombre = cambios.get("nombre")
            if nuevo_nombre is not None:
                existente = uow.categorias.get_by_nombre(nuevo_nombre)
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado(f"Ya existe una categoría llamada '{nuevo_nombre}'")
            categoria.sqlmodel_update(cambios)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        # Baja lógica: no libera el nombre ni oculta sus productos.
        with self.uow as uow:
            categoria = self._get_activa(uow.categorias, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _get_activa(repo: CategoriaRepository, categoria_id: int) -> Categoria:
        categoria = repo.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"Categoría con id {categoria_id} no encontrada")
        return categoria
