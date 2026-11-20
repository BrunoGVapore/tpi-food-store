import { useCallback, useState } from "react";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { CategoriaFormModal } from "../components/CategoriaFormModal";
import { CategoriasTable } from "../components/CategoriasTable";
import {
    useActualizarCategoria,
    useCategorias,
    useCrearCategoria,
    useEliminarCategoria,
} from "../hooks/useCategorias";
import type { Categoria, CategoriaInput } from "../types/categoria";

type EstadoModal = { abierto: false } | { abierto: true; categoria: Categoria | null };

export function AdminCategoriasPage() {
    const { data: categorias = [], isPending, isError, error, refetch } = useCategorias();
    const crear = useCrearCategoria();
    const actualizar = useActualizarCategoria();
    const { mutate: eliminarCategoria } = useEliminarCategoria();

    const [modal, setModal] = useState<EstadoModal>({ abierto: false });
    const [errorForm, setErrorForm] = useState<string | null>(null);

    const abrir = useCallback((categoria: Categoria | null) => {
        setErrorForm(null);
        setModal({ abierto: true, categoria });
    }, []);

    const cerrar = () => setModal({ abierto: false });

    const handleEliminar = useCallback(
        (categoria: Categoria) => {
            const ok = window.confirm(
                `¿Dar de baja la categoría "${categoria.nombre}"? Sus productos siguen en el catálogo hasta que los des de baja.`
            );
            if (ok) eliminarCategoria(categoria.id);
        },
        [eliminarCategoria]
    );

    const handleSubmit = async (datos: CategoriaInput) => {
        if (!modal.abierto) return;
        setErrorForm(null);
        try {
            if (modal.categoria) await actualizar.mutateAsync({ id: modal.categoria.id, datos });
            else await crear.mutateAsync(datos);
            cerrar();
        } catch (e) {
            setErrorForm((e as Error).message); // por ejemplo, 409: nombre repetido
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-800">Categorías</h2>
                <Button onClick={() => abrir(null)}>+ Nueva categoría</Button>
            </div>

            {isPending ? (
                <SkeletonFilas />
            ) : isError ? (
                <EstadoError mensaje={error?.message ?? "No se pudieron cargar las categorías"} onReintentar={() => refetch()} />
            ) : categorias.length === 0 ? (
                <EstadoVacio titulo="Sin categorías" descripcion="Creá la primera categoría del catálogo." />
            ) : (
                <CategoriasTable categorias={categorias} onEditar={abrir} onEliminar={handleEliminar} />
            )}

            {modal.abierto && (
                <CategoriaFormModal
                    key={modal.categoria?.id ?? "nueva"}
                    categoria={modal.categoria}
                    error={errorForm}
                    onClose={cerrar}
                    onSubmit={handleSubmit}
                />
            )}
        </section>
    );
}
