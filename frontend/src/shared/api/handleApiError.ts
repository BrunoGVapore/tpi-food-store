import axios from "axios";

interface ErrorDeValidacion {
    msg: string;
}

function esListaDeValidacion(valor: unknown): valor is ErrorDeValidacion[] {
    return (
        Array.isArray(valor) &&
        valor.every((item) => typeof item === "object" && item !== null && "msg" in item)
    );
}

// Convierte el error de Axios en un mensaje para mostrar en pantalla, a partir del
// campo "detail" que devuelve FastAPI.
export function handleApiError(error: unknown, fallback = "No se pudo completar la operación"): string {
    if (!axios.isAxiosError(error)) return fallback;
    if (error.code === "ECONNABORTED") return "El servidor tardó demasiado en responder.";
    if (!error.response) return "No se pudo conectar con el servidor.";

    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (esListaDeValidacion(detail)) {
        // 422: errores de validación de Pydantic
        return detail.map((d) => d.msg.replace(/^Value error, /, "")).join(". ");
    }

    switch (error.response.status) {
        case 401:
            return "Tu sesión expiró. Volvé a iniciar sesión.";
        case 403:
            return "No tenés permisos para realizar esta acción.";
        case 404:
            return "El recurso no existe.";
        default:
            return fallback;
    }
}
