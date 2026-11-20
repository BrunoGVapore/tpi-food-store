import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/shared/ui/Button";

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive ? "bg-brand-soft text-brand" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
    }`;

export function Navbar() {
    const navigate = useNavigate();
    const usuario = useAuthStore((s) => s.usuario);
    const logout = useAuthStore((s) => s.logout);
    const cantidadCarrito = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0));
    const esAdmin = usuario?.role === "admin";

    const cerrarSesion = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
                <Link to="/" className="mr-4 flex items-center gap-2 text-lg font-extrabold text-stone-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
                        🍕
                    </span>
                    Food Store
                </Link>

                <NavLink to="/" end className={claseEnlace}>
                    Catálogo
                </NavLink>
                <NavLink to="/carrito" className={claseEnlace}>
                    Carrito
                    {cantidadCarrito > 0 && (
                        <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-xs font-bold text-white">
                            {cantidadCarrito}
                        </span>
                    )}
                </NavLink>
                {usuario && (
                    <NavLink to="/mis-pedidos" className={claseEnlace}>
                        Mis pedidos
                    </NavLink>
                )}
                {esAdmin && (
                    <NavLink to="/admin" className={claseEnlace}>
                        Panel admin
                    </NavLink>
                )}

                <div className="ml-auto flex items-center gap-3">
                    {usuario ? (
                        <>
                            <div className="hidden text-right leading-tight sm:block">
                                <p className="text-sm font-semibold text-stone-800">{usuario.full_name}</p>
                                <p className="text-xs text-stone-500">
                                    {esAdmin ? "Administrador" : "Cliente"} · @{usuario.username}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={cerrarSesion}>
                                Cerrar sesión
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-stone-700 hover:text-brand">
                                Ingresar
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
