import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import {
    actualizarProducto,
    actualizarStock,
    crearProducto,
    eliminarProducto,
    listarProductos,
} from "../api/productos";
import type { FiltrosProductos, ProductoInput, ProductoStockInput } from "../types/producto";

export const PRODUCTOS_KEY = ["productos"] as const;

// Listado paginado en el servidor. keepPreviousData mantiene la página anterior
// en pantalla mientras llega la siguiente (sin parpadeos).
export function useProductos(filtros: FiltrosProductos) {
    return useQuery({
        queryKey: [...PRODUCTOS_KEY, filtros],
        queryFn: () => listarProductos(filtros),
        placeholderData: keepPreviousData,
    });
}

function useInvalidarProductos() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: PRODUCTOS_KEY });
}

export function useCrearProducto() {
    const invalidar = useInvalidarProductos();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: crearProducto,
        onSuccess: (producto) => {
            invalidar();
            showNotification(`Producto "${producto.nombre}" creado`, "success");
        },
    });
}

export function useActualizarProducto() {
    const invalidar = useInvalidarProductos();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: ({ id, datos }: { id: number; datos: Partial<ProductoInput> }) =>
            actualizarProducto(id, datos),
        onSuccess: (producto) => {
            invalidar();
            showNotification(`Producto "${producto.nombre}" actualizado`, "success");
        },
    });
}

export function useActualizarStock() {
    const invalidar = useInvalidarProductos();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: ({ id, datos }: { id: number; datos: ProductoStockInput }) => actualizarStock(id, datos),
        onSuccess: (producto) => {
            invalidar();
            showNotification(`Stock de "${producto.nombre}": ${producto.stock} unidades`, "success");
        },
    });
}

export function useEliminarProducto() {
    const invalidar = useInvalidarProductos();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: eliminarProducto,
        onSuccess: () => {
            invalidar();
            showNotification("Producto dado de baja", "success");
        },
        onError: (error: Error) => showNotification(error.message, "error"),
    });
}
