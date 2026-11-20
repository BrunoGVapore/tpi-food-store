from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username", "full_name")
    @classmethod
    def validar_no_vacio(cls, v: str) -> str:
        limpio = v.strip()
        if not limpio:
            raise ValueError("El campo no puede estar vacío")
        return limpio

    @field_validator("password")
    @classmethod
    def validar_bytes(cls, v: str) -> str:
        # bcrypt solo usa los primeros 72 bytes
        if len(v.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return v


class UserPublic(SQLModel):
    """Datos públicos del usuario: nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
