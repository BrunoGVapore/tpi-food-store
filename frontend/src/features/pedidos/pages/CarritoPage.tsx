import { Link, useNavigate } from "react-router-dom";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Button } from "@/shared/ui/Button";
import { formatearPrecio } from "@/shared/utils/formato";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { CarritoItem } from "../components/CarritoItem";

export function CarritoPage() {
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);
    const vaciar = useCartStore((s) => s.vaciar);
    const usuario = useAuthStore((s) => s.usuario);
    const total = items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0);
    const unidades = items.reduce((suma, i) => suma + i.cantidad, 0);

    if (items.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="page-title">Tu carrito</h1>
                <EstadoVacio
                    titulo="Tu carrito está vacío"
                    descripcion="Recorré el catálogo y agregá lo que quieras pedir."
                    accion={
                        <Link to="/" className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover">
                            Ver el catálogo
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="page-title">Tu carrito</h1>
            <div className="grid gap-6 lg:grid-cols-3">
                <section className="panel px-5 lg:col-span-2">
                    <ul className="divide-y divide-stone-100">
                        {items.map((item) => (
                            <CarritoItem key={item.producto_id} item={item} />
                        ))}
                    </ul>
                </section>

                <aside className="panel h-fit space-y-4 p-5">
                    <h2 className="text-lg font-bold">Resumen</h2>
                    <div className="flex justify-between text-sm text-stone-600">
                        <span>
                            Subtotal ({unidades} {unidades === 1 ? "unidad" : "unidades"})
                        </span>
                        <span>{formatearPrecio(total)}</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200 pt-4 text-lg font-extrabold">
                        <span>Total</span>
                        <span>{formatearPrecio(total)}</span>
                    </div>
                    <Button className="w-full py-3" onClick={() => navigate("/checkout")}>
                        {usuario ? "Continuar con el pedido" : "Iniciar sesión para pedir"}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                            if (window.confirm("¿Vaciar el carrito?")) vaciar();
                        }}
                    >
                        Vaciar carrito
                    </Button>
                </aside>
            </div>
        </div>
    );
}
