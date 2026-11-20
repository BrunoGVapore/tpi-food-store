from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

MENSAJE_CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(request: Request) -> UserPublic:
    """Lee el JWT de la cookie HttpOnly, valida firma y expiración y carga el usuario."""
    no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión expirada",
    )
    token = request.cookies.get("access_token")
    if not token:
        raise no_autenticado

    payload = decode_access_token(token)
    username = payload.get("sub") if payload else None
    if not isinstance(username, str):
        raise no_autenticado

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise no_autenticado
        return UserPublic.model_validate(usuario)


def get_current_active_user(
    current_user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=MENSAJE_CUENTA_DESACTIVADA
        )
    return current_user


def require_role(allowed_roles: list[str]):
    def role_checker(
        current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return current_user

    return role_checker


CurrentUserDep = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUserDep = Annotated[UserPublic, Depends(require_role(["admin"]))]
