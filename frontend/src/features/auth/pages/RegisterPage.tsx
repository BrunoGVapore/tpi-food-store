import { useState } from "react";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { RegisterForm } from "../components/RegisterForm";
import { useRegister } from "../hooks/useRegister";
import type { RegisterInput } from "../types/auth";

export function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const registro = useRegister();
    const login = useAuthStore((s) => s.login);
    const showNotification = useNotificationStore((s) => s.showNotification);
    const [error, setError] = useState<string | null>(null);

    const desde = (location.state as { from?: Location } | null)?.from?.pathname;

    const handleRegister = async (datos: RegisterInput) => {
        setError(null);
        try {
            await registro.mutateAsync(datos);
            // Después del registro se inicia la sesión automáticamente.
            await login({ username: datos.username, password: datos.password });
            showNotification("¡Cuenta creada! Ya podés hacer tu pedido.", "success");
            navigate(desde ?? "/", { replace: true });
        } catch (e) {
            setError((e as Error).message); // por ejemplo, 409: usuario o email repetido
        }
    };

    return (
        <div className="mx-auto max-w-md py-6">
            <div className="panel p-8">
                <h1 className="page-title mb-1">Crear cuenta</h1>
                <p className="mb-6 text-sm text-stone-500">Registrate para hacer pedidos y seguir su estado.</p>
                {error && (
                    <div role="alert" className="alert-error mb-4">
                        {error}
                    </div>
                )}
                <RegisterForm onSubmit={handleRegister} />
                <p className="mt-6 text-center text-sm text-stone-600">
                    ¿Ya tenés cuenta?{" "}
                    <Link to="/login" state={location.state} className="font-semibold text-brand hover:underline">
                        Iniciá sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
