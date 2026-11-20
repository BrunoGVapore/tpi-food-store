import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/features/auth/api/auth";
import type { LoginCredentials, Rol, Usuario } from "@/features/auth/types/auth";
import { registrarManejadoresDeSesion } from "@/shared/api/axiosInstance";
import { queryClient } from "@/shared/api/queryClient";
import { useNotificationStore } from "@/store/notificationStore";

interface AuthState {
    usuario: Usuario | null;
    // true mientras checkSession confirma la sesión con GET /auth/me
    cargando: boolean;
    login: (credenciales: LoginCredentials) => Promise<Usuario>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    limpiarSesion: () => void;
    tieneRol: (...roles: Rol[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            usuario: null,
            cargando: true,

            login: async (credenciales) => {
                await authApi.login(credenciales); // el backend deja la cookie
                const usuario = await authApi.me();
                if (!usuario) throw new Error("No se pudo obtener el perfil del usuario");
                queryClient.clear(); // descarta datos cacheados de una sesión anterior
                set({ usuario, cargando: false });
                return usuario;
            },

            logout: async () => {
                try {
                    await authApi.logout(); // borra la cookie
                } finally {
                    get().limpiarSesion();
                }
            },

            checkSession: async () => {
                set({ cargando: true });
                const usuario = await authApi.me();
                set({ usuario, cargando: false });
            },

            limpiarSesion: () => {
                queryClient.clear();
                set({ usuario: null, cargando: false });
            },

            tieneRol: (...roles) => {
                const { usuario } = get();
                return usuario !== null && roles.includes(usuario.role);
            },
        }),
        {
            name: "auth-storage",
            // Solo se guardan los datos públicos del usuario: nunca el token
            // (que vive en la cookie HttpOnly y JavaScript no puede leer).
            partialize: (state) => ({ usuario: state.usuario }),
        }
    )
);

// Interceptor de Axios -> store: qué hacer si la sesión deja de ser válida.
registrarManejadoresDeSesion({
    onSesionInvalida: () => {
        if (useAuthStore.getState().usuario) {
            useAuthStore.getState().limpiarSesion();
            useNotificationStore.getState().showNotification("Tu sesión terminó. Volvé a iniciar sesión.", "info");
        }
    },
    onAccesoDenegado: () =>
        useNotificationStore.getState().showNotification("Acceso denegado: no tenés permisos.", "error"),
});
