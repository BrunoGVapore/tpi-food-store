from app.core.deps import MENSAJE_CUENTA_DESACTIVADA
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(Exception):
    """409: el username o el email ya están registrados."""


class CredencialesInvalidas(Exception):
    """401: usuario o contraseña incorrectos."""


class CuentaDesactivada(Exception):
    """400: la cuenta existe pero está desactivada."""


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(datos.username) is not None:
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(datos.email) is not None:
                raise UsuarioDuplicado("El email ya está registrado")

            nuevo = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=str(datos.email).strip().lower(),
                hashed_password=hash_password(datos.password),
                role="user",  # el registro público siempre crea clientes
            )
            uow.usuarios.add(nuevo)
            return UserPublic.model_validate(nuevo)

    def autenticar(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT (que el router pone en la cookie)."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas("Usuario o contraseña incorrectos")
            if usuario.disabled:
                raise CuentaDesactivada(MENSAJE_CUENTA_DESACTIVADA)
            return create_access_token({"sub": usuario.username, "role": usuario.role})
