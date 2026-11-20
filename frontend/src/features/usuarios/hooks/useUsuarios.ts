import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { activarUsuario, desactivarUsuario, listarUsuarios } from "../api/usuarios";

export const USUARIOS_KEY = ["usuarios"] as const;

export function useUsuarios() {
    return useQuery({ queryKey: USUARIOS_KEY, queryFn: listarUsuarios });
}

export function useActivarUsuario() {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: activarUsuario,
        onSuccess: (usuario) => {
            queryClient.invalidateQueries({ queryKey: USUARIOS_KEY });
            showNotification(`@${usuario.username} activado`, "success");
        },
        onError: (error: Error) => showNotification(error.message, "error"),
    });
}

export function useDesactivarUsuario() {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore((s) => s.showNotification);
    return useMutation({
        mutationFn: desactivarUsuario,
        onSuccess: (usuario) => {
            queryClient.invalidateQueries({ queryKey: USUARIOS_KEY });
            showNotification(`@${usuario.username} desactivado`, "success");
        },
        onError: (error: Error) => showNotification(error.message, "error"),
    });
}
