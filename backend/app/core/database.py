from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita check_same_thread=False porque FastAPI usa varios hilos.
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=_connect_args)


def importar_modelos() -> None:
    """Importa todos los modelos para que SQLModel registre las tablas y relaciones."""
    import app.modules.categorias.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.usuarios.models  # noqa: F401


def create_all_tables() -> None:
    importar_modelos()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # expire_on_commit=False: los objetos siguen legibles después del commit.
    return Session(engine, expire_on_commit=False)
