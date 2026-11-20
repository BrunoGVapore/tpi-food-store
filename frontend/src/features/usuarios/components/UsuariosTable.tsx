import { useMemo, useState } from "react";
import {
    createColumnHelper,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type PaginationState,
    type SortingState,
} from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import { Button } from "@/shared/ui/Button";
import type { Usuario } from "../types/usuario";

const columnHelper = createColumnHelper<Usuario>();

interface UsuariosTableProps {
    usuarios: Usuario[];
    usuarioActualId: number | undefined;
    procesando: boolean;
    onActivar: (usuario: Usuario) => void;
    onDesactivar: (usuario: Usuario) => void;
}

export function UsuariosTable({ usuarios, usuarioActualId, procesando, onActivar, onDesactivar }: UsuariosTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const columns = useMemo(
        () => [
            columnHelper.accessor("username", {
                header: "Usuario",
                cell: (info) => <span className="font-semibold text-stone-900">@{info.getValue()}</span>,
            }),
            columnHelper.accessor("full_name", { header: "Nombre" }),
            columnHelper.accessor("email", { header: "Email" }),
            columnHelper.accessor("role", {
                header: "Rol",
                cell: (info) =>
                    info.getValue() === "admin" ? (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                            Admin
                        </span>
                    ) : (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                            Cliente
                        </span>
                    ),
            }),
            columnHelper.accessor("disabled", {
                header: "Estado",
                cell: (info) =>
                    info.getValue() ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            Desactivado
                        </span>
                    ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Activo
                        </span>
                    ),
            }),
            columnHelper.display({
                id: "acciones",
                header: "Acciones",
                cell: (info) => {
                    const usuario = info.row.original;
                    if (usuario.disabled) {
                        return (
                            <Button size="sm" variant="outline" disabled={procesando} onClick={() => onActivar(usuario)}>
                                Activar
                            </Button>
                        );
                    }
                    // El admin no puede desactivarse a sí mismo: no se muestra el botón en su fila.
                    if (usuario.id === usuarioActualId) {
                        return <span className="text-xs text-stone-400">Tu cuenta</span>;
                    }
                    return (
                        <Button size="sm" variant="danger" disabled={procesando} onClick={() => onDesactivar(usuario)}>
                            Desactivar
                        </Button>
                    );
                },
            }),
        ],
        [usuarioActualId, procesando, onActivar, onDesactivar]
    );

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table: aviso informativo del React Compiler
    const table = useReactTable({
        data: usuarios,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return <DataTable table={table} />;
}
