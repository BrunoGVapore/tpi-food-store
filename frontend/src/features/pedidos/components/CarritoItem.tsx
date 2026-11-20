import { ProductoImagen } from "@/features/productos";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore, type ItemCarrito } from "@/store/cartStore";

export function CarritoItem({ item }: { item: ItemCarrito }) {
    const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
    const quitar = useCartStore((s) => s.quitar);

    return (
        <li className="flex flex-wrap items-center gap-4 py-4">
            <ProductoImagen url={item.imagen_url} nombre={item.nombre} className="h-16 w-16 shrink-0 rounded-lg text-2xl" />
            <div className="min-w-40 flex-1">
                <p className="font-semibold text-stone-900">{item.nombre}</p>
                <p className="text-sm text-stone-500">{formatearPrecio(item.precio_unitario)} c/u</p>
            </div>

            <div className="flex items-center rounded-lg border border-stone-300" aria-label={`Cantidad de ${item.nombre}`}>
                <button
                    type="button"
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                    className="cursor-pointer px-3 py-1.5 text-lg leading-none text-stone-600 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Quitar una unidad"
                >
                    −
                </button>
                <span className="w-10 text-center font-semibold">{item.cantidad}</span>
                <button
                    type="button"
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                    className="cursor-pointer px-3 py-1.5 text-lg leading-none text-stone-600 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Agregar una unidad"
                >
                    +
                </button>
            </div>

            <p className="w-28 text-right font-bold text-stone-900">
                {formatearPrecio(item.precio_unitario * item.cantidad)}
            </p>
            <button
                type="button"
                onClick={() => quitar(item.producto_id)}
                className="cursor-pointer text-sm font-medium text-error hover:underline"
            >
                Quitar
            </button>
        </li>
    );
}
