from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import AdminUserDep
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_admin: AdminUserDep, service: ServiceDep):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, _admin: AdminUserDep, service: ServiceDep):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: AdminUserDep, service: ServiceDep):
    try:
        return service.desactivar(usuario_id, admin_id=admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except AutoDesactivacion as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
