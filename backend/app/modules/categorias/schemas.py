from pydantic import field_validator
from sqlmodel import Field, SQLModel


def _limpiar_nombre(v: str) -> str:
    limpio = v.strip()
    if not 2 <= len(limpio) <= 100:
        raise ValueError("El nombre debe tener entre 2 y 100 caracteres")
    return limpio


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str) -> str:
        return _limpiar_nombre(v)


class CategoriaUpdate(SQLModel):
    """Actualización parcial: solo se modifican los campos enviados."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str | None) -> str | None:
        return None if v is None else _limpiar_nombre(v)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
