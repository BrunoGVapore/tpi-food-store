import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { actualizarCategoria, crearCategoria, eliminarCategoria, listarCategorias } from "../api/categorias";
import type { CategoriaInput } from "../types/categoria";

export const CATEGORIAS_KEY = ["categorias"] as const;

// Categorías activas: las usan el filtro del catálogo, el formulario de productos y el ABM.
export function useCategorias() {
    return useQuery({ queryKey: CATEGORIAS_KEY, queryFn: listarCategorias });
}

function useInvalidarCatalogo() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY });
        // Los productos muestran el nombre de su categoría
        queryClient.invalidateQueries({ queryKey: ["productos"] });
    };
}

export function useCrearCategoria() {
    const invalidar = useInvalidarCatalogo();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: crearCategoria,
        onSuccess: (categoria) => {
            invalidar();
            showNotification(`Categoría "${categoria.nombre}" creada`, "success");
        },
    });
}

export function useActualizarCategoria() {
    const invalidar = useInvalidarCatalogo();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: ({ id, datos }: { id: number; datos: Partial<CategoriaInput> }) =>
            actualizarCategoria(id, datos),
        onSuccess: (categoria) => {
            invalidar();
            showNotification(`Categoría "${categoria.nombre}" actualizada`, "success");
        },
    });
}

export function useEliminarCategoria() {
    const invalidar = useInvalidarCatalogo();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: eliminarCategoria,
        onSuccess: () => {
            invalidar();
            showNotification("Categoría dada de baja", "success");
        },
        onError: (error: Error) => showNotification(error.message, "error"),
    });
}
