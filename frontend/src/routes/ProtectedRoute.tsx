import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/auth";
import { Cargando } from "@/shared/components/Cargando";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
    allowedRoles?: Rol[]; // sin roles: alcanza con tener sesión
}

// Ruta de layout: protege a todas sus rutas hijas, que se renderizan en <Outlet />.
// Es solo experiencia de usuario: la protección real la hace el backend (require_role).
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const usuario = useAuthStore((s) => s.usuario);
    const cargando = useAuthStore((s) => s.cargando);
    const location = useLocation();

    if (cargando) return <Cargando mensaje="Verificando sesión..." />;

    if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;

    if (allowedRoles && !allowedRoles.includes(usuario.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
