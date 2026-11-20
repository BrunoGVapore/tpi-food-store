import { useState } from "react";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { LoginForm } from "../components/LoginForm";
import type { LoginCredentials } from "../types/auth";

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((s) => s.login);
    const showNotification = useNotificationStore((s) => s.showNotification);
    const [error, setError] = useState<string | null>(null);

    // ProtectedRoute guarda la pantalla que se pidió sin sesión para volver a ella.
    const desde = (location.state as { from?: Location } | null)?.from?.pathname;

    const handleLogin = async (credenciales: LoginCredentials) => {
        setError(null);
        try {
            const usuario = await login(credenciales);
            showNotification(`¡Hola, ${usuario.full_name}!`, "success");
            navigate(desde ?? (usuario.role === "admin" ? "/admin/resumen" : "/"), { replace: true });
        } catch (e) {
            setError((e as Error).message); // 401 credenciales o 400 cuenta desactivada
        }
    };

    return (
        <div className="mx-auto max-w-md py-6">
            <div className="panel p-8">
                <h1 className="page-title mb-1">Iniciar sesión</h1>
                <p className="mb-6 text-sm text-stone-500">Ingresá para confirmar pedidos y ver tu historial.</p>
                {error && (
                    <div role="alert" className="alert-error mb-4">
                        {error}
                    </div>
                )}
                <LoginForm onSubmit={handleLogin} />
                <p className="mt-6 text-center text-sm text-stone-600">
                    ¿No tenés cuenta?{" "}
                    <Link to="/register" state={location.state} className="font-semibold text-brand hover:underline">
                        Registrate
                    </Link>
                </p>
            </div>
        </div>
    );
}
