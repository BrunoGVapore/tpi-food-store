from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import CurrentUserDep
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "access_token"


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]
FormDep = Annotated[OAuth2PasswordRequestForm, Depends()]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(datos: UserCreate, service: ServiceDep):
    try:
        return service.registrar(datos)
    except UsuarioDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e


@router.post("/token", response_model=MessageResponse)
def login(form_data: FormDep, response: Response, service: ServiceDep):
    try:
        token = service.autenticar(form_data.username, form_data.password)
    except CredencialesInvalidas as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e
    except CuentaDesactivada as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e

    # El token viaja solo en la cookie HttpOnly: el cuerpo no lo incluye.
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # en producción con HTTPS: True
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax", secure=False)
    return MessageResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUserDep):
    return current_user
