import { EstadoError } from "@/shared/components/EstadoError";
import { Skeleton } from "@/shared/components/Skeleton";
import { formatearPrecio } from "@/shared/utils/formato";
import { ResumenCard } from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

export function AdminResumenPage() {
    const { data: resumen, isPending, isError, error, refetch } = useResumenPedidos();

    if (isPending) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-24" />
                ))}
            </div>
        );
    }

    if (isError || !resumen) {
        return <EstadoError mensaje={error?.message ?? "No se pudo cargar el resumen"} onReintentar={() => refetch()} />;
    }

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-bold text-stone-800">Resumen del negocio</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ResumenCard titulo="Pedidos de hoy" valor={resumen.pedidos_hoy} icono="📅" color="bg-orange-100" />
                <ResumenCard
                    titulo="Ingresos (entregados)"
                    valor={formatearPrecio(resumen.ingresos_entregados)}
                    icono="💰"
                    color="bg-green-100"
                />
                <ResumenCard titulo="Pendientes" valor={resumen.pendientes} icono="⏳" color="bg-amber-100" />
                <ResumenCard titulo="En preparación" valor={resumen.en_preparacion} icono="👨‍🍳" color="bg-sky-100" />
                <ResumenCard titulo="Entregados" valor={resumen.entregados} icono="✅" color="bg-green-100" />
                <ResumenCard titulo="Cancelados" valor={resumen.cancelados} icono="✖️" color="bg-stone-200" />
            </div>
        </section>
    );
}
