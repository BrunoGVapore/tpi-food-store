import { NavLink, Outlet } from "react-router-dom";

const secciones = [
    { to: "/admin/resumen", label: "Resumen" },
    { to: "/admin/pedidos", label: "Pedidos" },
    { to: "/admin/productos", label: "Productos" },
    { to: "/admin/categorias", label: "Categorías" },
    { to: "/admin/usuarios", label: "Usuarios" },
];

// Pestañas del panel de administración.
export function AdminLayout() {
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="page-title">Panel de administración</h1>
                <nav className="flex flex-wrap gap-1 rounded-xl bg-stone-200/70 p-1">
                    {secciones.map((s) => (
                        <NavLink
                            key={s.to}
                            to={s.to}
                            className={({ isActive }) =>
                                `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                    isActive ? "bg-white text-brand shadow-sm" : "text-stone-600 hover:text-stone-900"
                                }`
                            }
                        >
                            {s.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <Outlet />
        </div>
    );
}
