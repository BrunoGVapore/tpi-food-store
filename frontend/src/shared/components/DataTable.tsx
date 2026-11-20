import { flexRender, type Table } from "@tanstack/react-table";
import { Button } from "@/shared/ui/Button";

interface DataTableProps<T> {
    table: Table<T>;
    mostrarPaginacion?: boolean;
}

// Dibuja cualquier tabla de TanStack Table (cada feature define columnas y estado).
export function DataTable<T>({ table, mostrarPaginacion = true }: DataTableProps<T>) {
    const totalPaginas = Math.max(table.getPageCount(), 1);
    return (
        <div className="space-y-3">
            <div className="panel overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr
                                key={headerGroup.id}
                                className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500"
                            >
                                {headerGroup.headers.map((header) => {
                                    const ordenable = header.column.getCanSort();
                                    const orden = header.column.getIsSorted();
                                    return (
                                        <th key={header.id} className="px-4 py-3 whitespace-nowrap">
                                            {header.isPlaceholder ? null : (
                                                <button
                                                    type="button"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    disabled={!ordenable}
                                                    className={`flex items-center gap-1 uppercase ${ordenable ? "cursor-pointer select-none hover:text-stone-900" : ""}`}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {orden === "asc" ? " ▲" : orden === "desc" ? " ▼" : null}
                                                </button>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3 text-sm text-stone-700">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {mostrarPaginacion && totalPaginas > 1 && (
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        ← Anterior
                    </Button>
                    <span className="text-sm text-stone-600">
                        Página {table.getState().pagination.pageIndex + 1} de {totalPaginas}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente →
                    </Button>
                </div>
            )}
        </div>
    );
}
