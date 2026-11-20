import { api } from "@/shared/api/axiosInstance";
import { handleApiError } from "@/shared/api/handleApiError";
import type { LoginCredentials, MessageResponse, RegisterInput, Usuario } from "../types/auth";

// POST /auth/token espera un formulario OAuth2 (x-www-form-urlencoded), no JSON.
// La respuesta solo trae un mensaje: el JWT queda en la cookie HttpOnly.
export async function login({ username, password }: LoginCredentials): Promise<MessageResponse> {
    try {
        const form = new URLSearchParams({ username, password });
        const { data } = await api.post<MessageResponse>("/auth/token", form);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo iniciar sesión"), { cause: error });
    }
}

export async function register(datos: RegisterInput): Promise<Usuario> {
    try {
        const { data } = await api.post<Usuario>("/auth/register", datos);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo completar el registro"), { cause: error });
    }
}

// Devuelve null si no hay sesión válida (401) o la cuenta está desactivada.
export async function me(): Promise<Usuario | null> {
    try {
        const { data } = await api.get<Usuario>("/auth/me");
        return data;
    } catch {
        return null;
    }
}

export async function logout(): Promise<void> {
    await api.post("/auth/logout");
}
