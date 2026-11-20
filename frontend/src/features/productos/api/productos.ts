import { api } from "@/shared/api/axiosInstance";
import { handleApiError } from "@/shared/api/handleApiError";
import type {
    FiltrosProductos,
    Producto,
    ProductoInput,
    ProductosPaginados,
    ProductoStockInput,
} from "../types/producto";

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
    try {
        // Axios omite los parámetros undefined (filtros sin completar).
        const { data } = await api.get<ProductosPaginados>("/productos", {
            params: { ...filtros, search: filtros.search || undefined },
        });
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudieron cargar los productos"), { cause: error });
    }
}

export async function crearProducto(datos: ProductoInput): Promise<Producto> {
    try {
        const { data } = await api.post<Producto>("/productos", datos);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo crear el producto"), { cause: error });
    }
}

export async function actualizarProducto(id: number, datos: Partial<ProductoInput>): Promise<Producto> {
    try {
        const { data } = await api.put<Producto>(`/productos/${id}`, datos);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo actualizar el producto"), { cause: error });
    }
}

export async function actualizarStock(id: number, datos: ProductoStockInput): Promise<Producto> {
    try {
        const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos);
        return data;
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo actualizar el stock"), { cause: error });
    }
}

export async function eliminarProducto(id: number): Promise<void> {
    try {
        await api.delete(`/productos/${id}`);
    } catch (error) {
        throw new Error(handleApiError(error, "No se pudo eliminar el producto"), { cause: error });
    }
}
