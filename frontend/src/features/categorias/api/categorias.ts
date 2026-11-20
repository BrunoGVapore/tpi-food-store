import { api } from "@/shared/api/axiosInstance";
import { handleApiError } from "@/shared/api/handleApiError";
import type { Categoria, CategoriaInput } from "../types/categoria";

export async function listarCategorias(): Promise<Categoria[]> {
    try {
        const { data } = await api.get<Categoria[]>("/categorias");
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudieron cargar las categorías"), { cause: error });
    }
}

export async function crearCategoria(datos: CategoriaInput): Promise<Categoria> {
    try {
        const { data } = await api.post<Categoria>("/categorias", datos);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo crear la categoría"), { cause: error });
    }
}

export async function actualizarCategoria(id: number, datos: Partial<CategoriaInput>): Promise<Categoria> {
    try {
        const { data } = await api.put<Categoria>(`/categorias/${id}`, datos);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo actualizar la categoría"), { cause: error });
    }
}

export async function eliminarCategoria(id: number): Promise<void> {
    try {
        await api.delete(`/categorias/${id}`);
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo eliminar la categoría"), { cause: error });
    }
}
