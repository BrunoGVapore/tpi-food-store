from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables, importar_modelos
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

# Registra todos los modelos antes de configurar las relaciones.
importar_modelos()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    create_all_tables()  # crea las tablas que falten (los datos se cargan con el seed)
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST del sistema de pedidos de comida (TPI Programación 4).",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador envía la cookie HttpOnly solo a este origen.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)


@app.get("/", tags=["salud"])
def raiz() -> dict[str, str]:
    return {"message": "Food Store API", "docs": "/docs", "redoc": "/redoc"}
