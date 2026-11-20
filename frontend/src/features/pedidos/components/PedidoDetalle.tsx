import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";
import { NOMBRE_FORMA_PAGO } from "../types/estados";
import type { Pedido } from "../types/pedido";

// Datos completos del pedido. Las líneas muestran el nombre y el precio copiados
// al momento de la compra (no cambian aunque después cambie el producto).
export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <BadgeEstado estado={pedido.estado} />
                <span className="text-sm text-stone-500">Creado el {formatearFecha(pedido.created_at)}</span>
            </div>

            <dl className="grid gap-3 rounded-lg bg-stone-50 p-4 text-sm sm:grid-cols-2">
                <div>
                    <dt className="text-stone-500">Dirección de entrega</dt>
                    <dd className="font-medium text-stone-900">{pedido.direccion_entrega}</dd>
                </div>
                <div>
                    <dt className="text-stone-500">Forma de pago</dt>
                    <dd className="font-medium text-stone-900">{NOMBRE_FORMA_PAGO[pedido.forma_pago]}</dd>
                </div>
                {pedido.notas && (
                    <div className="sm:col-span-2">
                        <dt className="text-stone-500">Notas</dt>
                        <dd className="font-medium text-stone-900">{pedido.notas}</dd>
                    </div>
                )}
                <div className="sm:col-span-2">
                    <dt className="text-stone-500">Última actualización</dt>
                    <dd className="font-medium text-stone-900">{formatearFecha(pedido.updated_at)}</dd>
                </div>
            </dl>

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
                        <th className="py-2">Producto</th>
                        <th className="py-2 text-right">Precio</th>
                        <th className="py-2 text-right">Cant.</th>
                        <th className="py-2 text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {pedido.items.map((item) => (
                        <tr key={item.producto_id} className="border-b border-stone-100">
                            <td className="py-2 font-medium text-stone-900">{item.nombre_producto}</td>
                            <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
                            <td className="py-2 text-right">{item.cantidad}</td>
                            <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3} className="pt-3 text-right font-semibold">
                            Total
                        </td>
                        <td className="pt-3 text-right text-lg font-extrabold text-stone-900">
                            {formatearPrecio(pedido.total)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
