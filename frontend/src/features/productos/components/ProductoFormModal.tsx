import { useForm } from "@tanstack/react-form";
import { useCategorias } from "@/features/categorias";
import { Button } from "@/shared/ui/Button";
import { Campo, Input, Select, Textarea } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { primerError } from "@/shared/utils/formularios";
import type { Producto, ProductoInput } from "../types/producto";

interface ProductoFormModalProps {
    producto: Producto | null; // null = alta
    error: string | null;
    onClose: () => void;
    onSubmit: (datos: Partial<ProductoInput>) => Promise<void>;
}

const validarNombre = (value: string) =>
    !value.trim() ? "El nombre es obligatorio" : value.trim().length > 120 ? "Máximo 120 caracteres" : undefined;

const validarPrecio = (value: number) =>
    Number.isNaN(value) ? "Ingresá un precio" : value < 0 ? "El precio no puede ser negativo" : undefined;

const validarStock = (value: number) =>
    Number.isNaN(value)
        ? "Ingresá el stock"
        : value < 0
          ? "El stock no puede ser negativo"
          : !Number.isInteger(value)
            ? "El stock debe ser un número entero"
            : undefined;

const validarUrl = (value: string) => {
    if (!value.trim()) return undefined;
    try {
        new URL(value.trim());
        return undefined;
    } catch {
        return "Ingresá una URL válida (https://...)";
    }
};

const numeroOVacio = (valor: number) => (Number.isNaN(valor) ? "" : valor);

export function ProductoFormModal({ producto, error, onClose, onSubmit }: ProductoFormModalProps) {
    const { data: categorias = [] } = useCategorias();
    // Si la categoría actual fue dada de baja, igual se muestra en la lista.
    const opciones =
        producto && !categorias.some((c) => c.id === producto.categoria_id)
            ? [...categorias, { ...producto.categoria, nombre: `${producto.categoria.nombre} (dada de baja)` }]
            : categorias;

    const form = useForm({
        defaultValues: {
            nombre: producto?.nombre ?? "",
            descripcion: producto?.descripcion ?? "",
            precio_base: producto?.precio_base ?? Number.NaN,
            imagen_url: producto?.imagen_url ?? "",
            stock: producto?.stock ?? 0,
            disponible: producto?.disponible ?? true,
            categoria_id: producto?.categoria_id ?? 0,
        },
        onSubmit: async ({ value }) => {
            const datos: Partial<ProductoInput> = {
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim() || null,
                precio_base: value.precio_base,
                imagen_url: value.imagen_url.trim() || null,
                stock: value.stock,
                disponible: value.disponible,
            };
            // En la edición la categoría se envía solo si cambió.
            if (!producto || value.categoria_id !== producto.categoria_id) {
                datos.categoria_id = value.categoria_id;
            }
            await onSubmit(datos);
        },
    });

    return (
        <Modal title={producto ? "Editar producto" : "Nuevo producto"} onClose={onClose} error={error} wide>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="grid gap-4 sm:grid-cols-2"
                noValidate
            >
                <div className="sm:col-span-2">
                    <form.Field
                        name="nombre"
                        validators={{ onChange: ({ value }) => validarNombre(value), onBlur: ({ value }) => validarNombre(value) }}
                    >
                        {(f) => (
                            <Campo id="prod-nombre" label="Nombre" error={primerError(f.state.meta.errors)}>
                                <Input
                                    id="prod-nombre"
                                    placeholder="Ej. Pizza Muzzarella"
                                    value={f.state.value}
                                    onBlur={f.handleBlur}
                                    onChange={(e) => f.handleChange(e.target.value)}
                                />
                            </Campo>
                        )}
                    </form.Field>
                </div>

                <div className="sm:col-span-2">
                    <form.Field
                        name="descripcion"
                        validators={{ onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined) }}
                    >
                        {(f) => (
                            <Campo id="prod-descripcion" label="Descripción (opcional)" error={primerError(f.state.meta.errors)}>
                                <Textarea
                                    id="prod-descripcion"
                                    rows={2}
                                    placeholder="Ej. Salsa de tomate, muzzarella y orégano"
                                    value={f.state.value}
                                    onBlur={f.handleBlur}
                                    onChange={(e) => f.handleChange(e.target.value)}
                                />
                            </Campo>
                        )}
                    </form.Field>
                </div>

                <form.Field
                    name="categoria_id"
                    validators={{
                        onChange: ({ value }) => (value > 0 ? undefined : "Elegí una categoría"),
                        onBlur: ({ value }) => (value > 0 ? undefined : "Elegí una categoría"),
                    }}
                >
                    {(f) => (
                        <Campo id="prod-categoria" label="Categoría" error={primerError(f.state.meta.errors)}>
                            <Select
                                id="prod-categoria"
                                value={f.state.value}
                                onBlur={f.handleBlur}
                                onChange={(e) => f.handleChange(Number(e.target.value))}
                            >
                                <option value={0}>Seleccioná...</option>
                                {opciones.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </Select>
                        </Campo>
                    )}
                </form.Field>

                <form.Field
                    name="precio_base"
                    validators={{ onChange: ({ value }) => validarPrecio(value), onBlur: ({ value }) => validarPrecio(value) }}
                >
                    {(f) => (
                        <Campo id="prod-precio" label="Precio base ($)" error={primerError(f.state.meta.errors)}>
                            <Input
                                id="prod-precio"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                                value={numeroOVacio(f.state.value)}
                                onBlur={f.handleBlur}
                                onChange={(e) => f.handleChange(e.target.valueAsNumber)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Field
                    name="stock"
                    validators={{ onChange: ({ value }) => validarStock(value), onBlur: ({ value }) => validarStock(value) }}
                >
                    {(f) => (
                        <Campo id="prod-stock" label="Stock (unidades)" error={primerError(f.state.meta.errors)}>
                            <Input
                                id="prod-stock"
                                type="number"
                                min={0}
                                step={1}
                                value={numeroOVacio(f.state.value)}
                                onBlur={f.handleBlur}
                                onChange={(e) => f.handleChange(e.target.valueAsNumber)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Field
                    name="imagen_url"
                    validators={{ onChange: ({ value }) => validarUrl(value), onBlur: ({ value }) => validarUrl(value) }}
                >
                    {(f) => (
                        <Campo id="prod-imagen" label="URL de la imagen (opcional)" error={primerError(f.state.meta.errors)}>
                            <Input
                                id="prod-imagen"
                                type="url"
                                placeholder="https://..."
                                value={f.state.value}
                                onBlur={f.handleBlur}
                                onChange={(e) => f.handleChange(e.target.value)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Field name="disponible">
                    {(f) => (
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 sm:col-span-2">
                            <input
                                type="checkbox"
                                checked={f.state.value}
                                onChange={(e) => f.handleChange(e.target.checked)}
                                className="h-4 w-4 accent-brand"
                            />
                            Disponible para la venta
                        </label>
                    )}
                </form.Field>

                <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                        {([canSubmit, isSubmitting]) => (
                            <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                {isSubmitting ? "Guardando..." : "Guardar"}
                            </Button>
                        )}
                    </form.Subscribe>
                </div>
            </form>
        </Modal>
    );
}
