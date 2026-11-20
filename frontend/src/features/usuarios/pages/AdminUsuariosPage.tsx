import { useCallback } from "react";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { useAuthStore } from "@/store/authStore";
import { UsuariosTable } from "../components/UsuariosTable";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "../hooks/useUsuarios";
import type { Usuario } from "../types/usuario";

export function AdminUsuariosPage() {
    const usuarioActual = useAuthStore((s) => s.usuario);
    const { data: usuarios = [], isPending, isError, error, refetch } = useUsuarios();
    const { mutate: activar, isPending: activando } = useActivarUsuario();
    const { mutate: desactivar, isPending: desactivando } = useDesactivarUsuario();

    const handleActivar = useCallback((usuario: Usuario) => activar(usuario.id), [activar]);
    const handleDesactivar = useCallback(
        (usuario: Usuario) => {
            if (window.confirm(`¿Desactivar a @${usuario.username}? No va a poder iniciar sesión.`)) {
                desactivar(usuario.id);
            }
        },
        [desactivar]
    );

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-bold text-stone-800">Usuarios</h2>
            {isPending ? (
                <SkeletonFilas />
            ) : isError ? (
                <EstadoError mensaje={error?.message ?? "No se pudieron cargar los usuarios"} onReintentar={() => refetch()} />
            ) : usuarios.length === 0 ? (
                <EstadoVacio titulo="Sin usuarios" />
            ) : (
                <UsuariosTable
                    usuarios={usuarios}
                    usuarioActualId={usuarioActual?.id}
                    procesando={activando || desactivando}
                    onActivar={handleActivar}
                    onDesactivar={handleDesactivar}
                />
            )}
        </section>
    );
}
