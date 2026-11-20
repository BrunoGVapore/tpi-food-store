import { useEffect } from "react";
import { AppRouter } from "@/routes/AppRouter";
import { Toast } from "@/shared/components/Toast";
import { useAuthStore } from "@/store/authStore";

// La única petición al servidor dentro de un useEffect: confirmar la sesión con /auth/me al montar.
export default function App() {
    const checkSession = useAuthStore((s) => s.checkSession);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    return (
        <>
            <AppRouter />
            <Toast />
        </>
    );
}
