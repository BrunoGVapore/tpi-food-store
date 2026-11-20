import { useMemo, useState } from "react";
import {
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type PaginationState,
    type SortingState,
} from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { formatearPrecio } from "@/shared/utils/formato";
import type { Producto } from "../types/producto";
import { ProductoImagen } from "./ProductoImagen";

const columnHelper = createColumnHelper<Producto>();

interface ProductosTableProps {
    productos: Producto[];
    onEditar: (producto: Producto) => void;
    onStock: (producto: Producto) => void;
    onEliminar: (producto: Producto) => void;
}

export function ProductosTable({ productos, onEditar, onStock, onEliminar }: ProductosTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [filtro, setFiltro] = useState("");

    const columns = useMemo(
        () => [
            columnHelper.accessor("id", { header: "ID" }),
            columnHelper.accessor("nombre", {
                header: "Producto",
                cell: (info) => (
                    <div className="flex items-center gap-3">
                        <ProductoImagen
                            url={info.row.original.imagen_url}
                            nombre={info.getValue()}
                            className="h-10 w-10 shrink-0 rounded-lg text-base"
                        />
                        <span className="font-semibold text-stone-900">{info.getValue()}</span>
                    </div>
                ),
            }),
            columnHelper.accessor((p) => p.categoria.nombre, { id: "categoria", header: "Categoría" }),
            columnHelper.accessor("precio_base", {
                header: "Precio",
                cell: (info) => formatearPrecio(info.getValue()),
            }),
            columnHelper.accessor("stock", {
                header: "Stock",
                cell: (info) => (
                    <span className={info.getValue() === 0 ? "font-semibold text-error" : ""}>{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("disponible", {
                header: "Estado",
                cell: (info) =>
                    info.getValue() ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Disponible
                        </span>
                    ) : (
                        <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-600">
                            No disponible
                        </span>
                    ),
            }),
            columnHelper.display({
                id: "acciones",
                header: "Acciones",
                cell: (info) => (
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEditar(info.row.original)}>
                            Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onStock(info.row.original)}>
                            Stock
                        </Button>
                        <Button variant="ghost" size="sm" className="text-error" onClick={() => onEliminar(info.row.original)}>
                            Dar de baja
                        </Button>
                    </div>
                ),
            }),
        ],
        [onEditar, onStock, onEliminar]
    );

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table: aviso informativo del React Compiler
    const table = useReactTable({
        data: productos,
        columns,
        state: { sorting, pagination, globalFilter: filtro },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setFiltro,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-3">
            <Input
                type="search"
                aria-label="Filtrar productos"
                placeholder="Filtrar por nombre o categoría..."
                value={filtro}
                onChange={(e) => {
                    setFiltro(e.target.value);
                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className="max-w-sm"
            />
            <DataTable table={table} />
        </div>
    );
}
