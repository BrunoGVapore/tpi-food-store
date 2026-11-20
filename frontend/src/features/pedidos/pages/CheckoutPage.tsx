import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { CheckoutForm, type DatosCheckout } from "../components/CheckoutForm";
import { useCrearPedido } from "../hooks/usePedidos";

export function CheckoutPage() {
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);
    const vaciar = useCartStore((s) => s.vaciar);
    const showNotification = useNotificationStore((s) => s.showNotification);
    const crearPedido = useCrearPedido();
    const [error, setError] = useState<string | null>(null);
    const total = items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0);

    const confirmar = async (datos: DatosCheckout) => {
        setError(null);
        try {
            const pedido = await crearPedido.mutateAsync({
                ...datos,
                items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
            });
            vaciar();
            showNotification(`¡Pedido #${pedido.id} confirmado!`, "success");
            navigate("/mis-pedidos", { replace: true });
        } catch (e) {
            // Por ejemplo: stock insuficiente o producto no disponible (400)
            setError((e as Error).message);
        }
    };

    if (items.length === 0) {
        return (
            <EstadoVacio
                titulo="No hay productos para confirmar"
                descripcion="Agregá productos al carrito antes de confirmar el pedido."
                accion={
                    <Link to="/" className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover">
                        Ver el catálogo
                    </Link>
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="page-title">Confirmar pedido</h1>
            <div className="grid gap-6 lg:grid-cols-5">
                <section className="panel space-y-4 p-6 lg:col-span-3">
                    <h2 className="text-lg font-bold">Datos de entrega y pago</h2>
                    {error && (
                        <div role="alert" className="alert-error">
                            {error}{" "}
                            <Link to="/carrito" className="font-semibold underline">
                                Revisar el carrito
                            </Link>
                        </div>
                    )}
                    <CheckoutForm onSubmit={confirmar} />
                </section>

                <aside className="panel h-fit space-y-3 p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold">Tu pedido</h2>
                    <ul className="space-y-2 text-sm">
                        {items.map((i) => (
                            <li key={i.producto_id} className="flex justify-between gap-3">
                                <span className="text-stone-700">
                                    {i.cantidad}× {i.nombre}
                                </span>
                                <span className="font-medium">{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-extrabold">
                        <span>Total</span>
                        <span>{formatearPrecio(total)}</span>
                    </div>
                    <p className="text-xs text-stone-500">
                        El total final lo calcula el servidor con los precios vigentes al confirmar.
                    </p>
                </aside>
            </div>
        </div>
    );
}
