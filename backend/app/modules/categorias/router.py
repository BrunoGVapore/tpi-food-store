from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import AdminUserDep
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


def _traducir(e: Exception) -> HTTPException:
    """Convierte las excepciones de dominio en respuestas HTTP."""
    if isinstance(e, CategoriaNoEncontrada):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    if isinstance(e, NombreDuplicado):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    raise e


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise _traducir(e) from e


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(datos: CategoriaCreate, _admin: AdminUserDep, service: ServiceDep):
    try:
        return service.crear(datos)
    except NombreDuplicado as e:
        raise _traducir(e) from e


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int, datos: CategoriaUpdate, _admin: AdminUserDep, service: ServiceDep
):
    try:
        return service.actualizar(categoria_id, datos)
    except (CategoriaNoEncontrada, NombreDuplicado) as e:
        raise _traducir(e) from e


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, _admin: AdminUserDep, service: ServiceDep):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise _traducir(e) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
