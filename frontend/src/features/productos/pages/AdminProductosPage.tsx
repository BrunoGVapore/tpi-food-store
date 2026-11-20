import { useCallback, useState } from "react";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { ProductoFormModal } from "../components/ProductoFormModal";
import { ProductosTable } from "../components/ProductosTable";
import { StockModal } from "../components/StockModal";
import {
    useActualizarProducto,
    useActualizarStock,
    useCrearProducto,
    useEliminarProducto,
    useProductos,
} from "../hooks/useProductos";
import type { Producto, ProductoInput, ProductoStockInput } from "../types/producto";

type EstadoModal =
    | { tipo: "cerrado" }
    | { tipo: "form"; producto: Producto | null }
    | { tipo: "stock"; producto: Producto };

// El panel pide hasta 100 productos y pagina del lado del cliente con TanStack Table.
const FILTROS_PANEL = { skip: 0, limit: 100 };

export function AdminProductosPage() {
    const { data, isPending, isError, error, refetch } = useProductos(FILTROS_PANEL);
    const crear = useCrearProducto();
    const actualizar = useActualizarProducto();
    const stock = useActualizarStock();
    const { mutate: eliminarProducto } = useEliminarProducto();

    const [modal, setModal] = useState<EstadoModal>({ tipo: "cerrado" });
    const [errorForm, setErrorForm] = useState<string | null>(null);

    const abrirForm = useCallback((producto: Producto | null) => {
        setErrorForm(null);
        setModal({ tipo: "form", producto });
    }, []);

    const abrirStock = useCallback((producto: Producto) => {
        setErrorForm(null);
        setModal({ tipo: "stock", producto });
    }, []);

    const cerrar = () => setModal({ tipo: "cerrado" });

    const handleEliminar = useCallback(
        (producto: Producto) => {
            if (window.confirm(`¿Dar de baja "${producto.nombre}"? Dejará de verse en el catálogo.`)) {
                eliminarProducto(producto.id);
            }
        },
        [eliminarProducto]
    );

    const guardarProducto = async (datos: Partial<ProductoInput>) => {
        if (modal.tipo !== "form") return;
        setErrorForm(null);
        try {
            if (modal.producto) await actualizar.mutateAsync({ id: modal.producto.id, datos });
            else await crear.mutateAsync(datos as ProductoInput); // en el alta se envían todos los campos
            cerrar();
        } catch (e) {
            setErrorForm((e as Error).message);
        }
    };

    const guardarStock = async (datos: ProductoStockInput) => {
        if (modal.tipo !== "stock") return;
        setErrorForm(null);
        try {
            await stock.mutateAsync({ id: modal.producto.id, datos });
            cerrar();
        } catch (e) {
            setErrorForm((e as Error).message);
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-800">Productos</h2>
                <Button onClick={() => abrirForm(null)}>+ Nuevo producto</Button>
            </div>

            {isPending ? (
                <SkeletonFilas />
            ) : isError || !data ? (
                <EstadoError mensaje={error?.message ?? "No se pudieron cargar los productos"} onReintentar={() => refetch()} />
            ) : data.items.length === 0 ? (
                <EstadoVacio titulo="Sin productos" descripcion="Cargá el primer producto del catálogo." />
            ) : (
                <ProductosTable
                    productos={data.items}
                    onEditar={abrirForm}
                    onStock={abrirStock}
                    onEliminar={handleEliminar}
                />
            )}

            {modal.tipo === "form" && (
                <ProductoFormModal
                    key={modal.producto?.id ?? "nuevo"}
                    producto={modal.producto}
                    error={errorForm}
                    onClose={cerrar}
                    onSubmit={guardarProducto}
                />
            )}
            {modal.tipo === "stock" && (
                <StockModal
                    key={modal.producto.id}
                    producto={modal.producto}
                    error={errorForm}
                    onClose={cerrar}
                    onSubmit={guardarStock}
                />
            )}
        </section>
    );
}
