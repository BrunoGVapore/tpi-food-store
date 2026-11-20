import axios from "axios";

export const MENSAJE_CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

// En estas rutas un 401 es una respuesta esperada (credenciales incorrectas o
// visitante sin sesión), así que no debe limpiar la sesión.
const RUTAS_DE_AUTH = ["/auth/token", "/auth/me"];

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
    timeout: 10000,
    withCredentials: true, // el navegador adjunta la cookie HttpOnly en cada petición
});

interface ManejadoresDeSesion {
    onSesionInvalida: () => void;
    onAccesoDenegado?: () => void;
}

// El authStore registra aquí qué hacer cuando la sesión deja de ser válida.
// Así esta instancia no importa el store y se evita una dependencia circular.
let manejadores: ManejadoresDeSesion | null = null;

export function registrarManejadoresDeSesion(nuevos: ManejadoresDeSesion): void {
    manejadores = nuevos;
}

api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            const url = error.config?.url ?? "";
            const esRutaDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));
            const detail = (data as { detail?: unknown } | undefined)?.detail;

            // 401 (sesión vencida o inválida) o cuenta desactivada: se limpia la sesión.
            // ProtectedRoute redirige a /login al quedar sin usuario.
            if ((status === 401 && !esRutaDeAuth) || detail === MENSAJE_CUENTA_DESACTIVADA) {
                manejadores?.onSesionInvalida();
            }
            if (status === 403) {
                manejadores?.onAccesoDenegado?.();
            }
        }
        return Promise.reject(error);
    }
);
