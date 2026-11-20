import { formatearPrecio } from "@/shared/utils/formato";
import { Button } from "@/shared/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import type { Producto } from "../types/producto";
import { ProductoImagen } from "./ProductoImagen";

export function ProductoCard({ producto }: { producto: Producto }) {
    const agregar = useCartStore((s) => s.agregar);
    const enCarrito = useCartStore(
        (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0
    );
    const showNotification = useNotificationStore((s) => s.showNotification);

    const sinStock = producto.stock <= 0;
    const vendible = producto.disponible && !sinStock;
    const llegoAlTope = enCarrito >= producto.stock;

    const handleAgregar = () => {
        agregar({
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
            stock: producto.stock,
            imagen_url: producto.imagen_url,
        });
        showNotification(`"${producto.nombre}" agregado al carrito`, "success");
    };

    return (
        <article className="panel flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative">
                <ProductoImagen url={producto.imagen_url} nombre={producto.nombre} className="h-40 w-full text-5xl" />
                {!vendible && (
                    <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-white">
                        {sinStock ? "Sin stock" : "No disponible"}
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                    {producto.categoria.nombre}
                </span>
                <h3 className="font-bold leading-snug text-stone-900">{producto.nombre}</h3>
                {producto.descripcion && (
                    <p className="line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>
                )}
                <div className="mt-auto flex items-end justify-between pt-2">
                    <span className="text-lg font-extrabold text-stone-900">{formatearPrecio(producto.precio_base)}</span>
                    {vendible && <span className="text-xs text-stone-400">Stock: {producto.stock}</span>}
                </div>
                <Button onClick={handleAgregar} disabled={!vendible || llegoAlTope} className="w-full">
                    {!vendible
                        ? "No disponible"
                        : llegoAlTope
                          ? "Máximo en el carrito"
                          : enCarrito > 0
                            ? `Agregar otro (${enCarrito})`
                            : "Agregar al carrito"}
                </Button>
            </div>
        </article>
    );
}
