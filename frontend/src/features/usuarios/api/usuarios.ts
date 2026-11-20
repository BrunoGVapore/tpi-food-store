import { api } from "@/shared/api/axiosInstance";
import { handleApiError } from "@/shared/api/handleApiError";
import type { Usuario } from "../types/usuario";

export async function listarUsuarios(): Promise<Usuario[]> {
    try {
        const { data } = await api.get<Usuario[]>("/admin/usuarios");
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudieron cargar los usuarios"), { cause: error });
    }
}

export async function activarUsuario(id: number): Promise<Usuario> {
    try {
        const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/activar`);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo activar el usuario"), { cause: error });
    }
}

export async function desactivarUsuario(id: number): Promise<Usuario> {
    try {
        const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo desactivar el usuario"), { cause: error });
    }
}
