from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Abre la sesión al entrar al bloque with y hace commit o rollback al salir.

    Es el único lugar del proyecto donde se llama a session.commit().
    """

    session: Session

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory):
        self.session_factory = session_factory

    def __enter__(self) -> Self:
        self.session = self.session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
