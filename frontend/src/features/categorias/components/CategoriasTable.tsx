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
import type { Categoria } from "../types/categoria";

const columnHelper = createColumnHelper<Categoria>();

interface CategoriasTableProps {
    categorias: Categoria[];
    onEditar: (categoria: Categoria) => void;
    onEliminar: (categoria: Categoria) => void;
}

export function CategoriasTable({ categorias, onEditar, onEliminar }: CategoriasTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const columns = useMemo(
        () => [
            columnHelper.accessor("id", { header: "ID" }),
            columnHelper.accessor("nombre", {
                header: "Nombre",
                cell: (info) => <span className="font-semibold text-stone-900">{info.getValue()}</span>,
            }),
            columnHelper.accessor("descripcion", {
                header: "Descripción",
                enableSorting: false,
                cell: (info) => info.getValue() || <span className="text-stone-400">—</span>,
            }),
            columnHelper.display({
                id: "acciones",
                header: "Acciones",
                cell: (info) => (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEditar(info.row.original)}>
                            Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-error" onClick={() => onEliminar(info.row.original)}>
                            Dar de baja
                        </Button>
                    </div>
                ),
            }),
        ],
        [onEditar, onEliminar]
    );

    // TanStack Table no es compatible con la memoización automática del React Compiler;
    // el aviso es informativo y el componente funciona igual.
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: categorias,
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
