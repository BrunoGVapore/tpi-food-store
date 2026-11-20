"""Carga los datos iniciales. Idempotente: se puede ejecutar varias veces.

Uso (desde la carpeta backend/):  python -m app.db.seed
"""

from sqlmodel import select

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra con masa casera"),
    ("Hamburguesas", "Hamburguesas de carne vacuna con papas"),
    ("Empanadas", "Empanadas al horno, por unidad"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Postres caseros"),
]

# (nombre, descripcion, precio_base, stock, categoria)
PRODUCTOS = [
    ("Pizza Muzzarella", "Salsa de tomate, muzzarella y orégano", 12000, 20, "Pizzas"),
    ("Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 13500, 15, "Pizzas"),
    ("Pizza Fugazzeta", "Muzzarella y cebolla", 13000, 12, "Pizzas"),
    ("Hamburguesa Clásica", "Carne, lechuga, tomate y papas fritas", 9500, 25, "Hamburguesas"),
    ("Hamburguesa Doble Cheddar", "Doble carne, cheddar y panceta", 12500, 18, "Hamburguesas"),
    ("Empanada de Carne", "Carne cortada a cuchillo", 1500, 60, "Empanadas"),
    ("Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400, 60, "Empanadas"),
    ("Gaseosa 1.5 L", "Línea Coca-Cola", 3500, 40, "Bebidas"),
    ("Agua sin gas 500 ml", "Agua mineral", 1800, 40, "Bebidas"),
    ("Flan casero", "Con dulce de leche", 4000, 10, "Postres"),
]


def seed() -> None:
    create_all_tables()
    creados = {"usuarios": 0, "categorias": 0, "productos": 0}

    with UnitOfWork() as uow:
        session = uow.session

        if (
            session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first()
            is None
        ):
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            creados["usuarios"] += 1

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
                creados["categorias"] += 1
            categorias[nombre] = categoria

        for nombre, descripcion, precio, stock, nombre_categoria in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                categoria = categorias[nombre_categoria]
                assert categoria.id is not None
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        categoria_id=categoria.id,
                    )
                )
                creados["productos"] += 1
        # El commit lo hace el Unit of Work al salir del bloque.

    print(
        "Seed completado. Nuevos registros -> "
        f"usuarios: {creados['usuarios']}, categorías: {creados['categorias']}, "
        f"productos: {creados['productos']}"
    )
    print(f"Usuario admin: {ADMIN['username']} / {ADMIN['password']}")


if __name__ == "__main__":
    seed()
