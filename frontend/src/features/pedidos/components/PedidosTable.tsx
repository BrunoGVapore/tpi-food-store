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
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";
import { ACCION_ESTADO, NOMBRE_FORMA_PAGO, TRANSICIONES } from "../types/estados";
import type { EstadoPedido, Pedido } from "../types/pedido";

const columnHelper = createColumnHelper<Pedido>();

interface PedidosTableProps {
    pedidos: Pedido[];
    procesando: boolean;
    onVerDetalle: (pedido: Pedido) => void;
    onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void;
}

export function PedidosTable({ pedidos, procesando, onVerDetalle, onCambiarEstado }: PedidosTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const columns = useMemo(
        () => [
            columnHelper.accessor("id", {
                header: "N°",
                cell: (info) => <span className="font-semibold">#{info.getValue()}</span>,
            }),
            columnHelper.accessor("created_at", {
                header: "Fecha",
                cell: (info) => <span className="whitespace-nowrap">{formatearFecha(info.getValue())}</span>,
            }),
            columnHelper.accessor("usuario_id", {
                header: "Cliente",
                cell: (info) => `Usuario #${info.getValue()}`,
            }),
            columnHelper.accessor((p) => p.items.reduce((suma, i) => suma + i.cantidad, 0), {
                id: "unidades",
                header: "Unidades",
            }),
            columnHelper.accessor("forma_pago", {
                header: "Pago",
                cell: (info) => NOMBRE_FORMA_PAGO[info.getValue()],
            }),
            columnHelper.accessor("total", {
                header: "Total",
                cell: (info) => <span className="font-semibold">{formatearPrecio(info.getValue())}</span>,
            }),
            columnHelper.accessor("estado", {
                header: "Estado",
                cell: (info) => <BadgeEstado estado={info.getValue()} />,
            }),
            columnHelper.display({
                id: "acciones",
                header: "Acciones",
                cell: (info) => {
                    const pedido = info.row.original;
                    return (
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => onVerDetalle(pedido)}>
                                Ver
                            </Button>
                            {TRANSICIONES[pedido.estado].map((destino) => (
                                <Button
                                    key={destino}
                                    size="sm"
                                    variant={destino === "CANCELADO" ? "danger" : "primary"}
                                    disabled={procesando}
                                    onClick={() => onCambiarEstado(pedido, destino)}
                                >
                                    {ACCION_ESTADO[destino]}
                                </Button>
                            ))}
                        </div>
                    );
                },
            }),
        ],
        [procesando, onVerDetalle, onCambiarEstado]
    );

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table: aviso informativo del React Compiler
    const table = useReactTable({
        data: pedidos,
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
