from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


def _limpiar_nombre(v: str) -> str:
    limpio = v.strip()
    if not limpio:
        raise ValueError("El nombre del producto es obligatorio")
    return limpio


class ProductoCreate(SQLModel):
    nombre: str = Field(min_length=1, max_length=120)
    descripcion: str | None = Field(default=None, max_length=500)
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str) -> str:
        return _limpiar_nombre(v)


class ProductoUpdate(SQLModel):
    """Actualización parcial: solo se modifican los campos enviados."""

    nombre: str | None = Field(default=None, min_length=1, max_length=120)
    descripcion: str | None = Field(default=None, max_length=500)
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = None

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str | None) -> str | None:
        return None if v is None else _limpiar_nombre(v)


class ProductoStockUpdate(SQLModel):
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
