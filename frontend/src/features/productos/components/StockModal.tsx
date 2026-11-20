import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Campo, Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { primerError } from "@/shared/utils/formularios";
import type { Producto, ProductoStockInput } from "../types/producto";

interface StockModalProps {
    producto: Producto;
    error: string | null;
    onClose: () => void;
    onSubmit: (datos: ProductoStockInput) => Promise<void>;
}

const validarStock = (value: number) =>
    Number.isNaN(value) || value < 0 || !Number.isInteger(value)
        ? "Ingresá un número entero mayor o igual a 0"
        : undefined;

// PATCH /productos/{id}/stock: cambia solo el stock y la disponibilidad.
export function StockModal({ producto, error, onClose, onSubmit }: StockModalProps) {
    const form = useForm({
        defaultValues: { stock: producto.stock, disponible: producto.disponible },
        onSubmit: async ({ value }) => onSubmit(value),
    });

    return (
        <Modal title={`Stock de ${producto.nombre}`} onClose={onClose} error={error}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4"
                noValidate
            >
                <form.Field
                    name="stock"
                    validators={{ onChange: ({ value }) => validarStock(value), onBlur: ({ value }) => validarStock(value) }}
                >
                    {(f) => (
                        <Campo id="stock-cantidad" label="Unidades en stock" error={primerError(f.state.meta.errors)}>
                            <Input
                                id="stock-cantidad"
                                type="number"
                                min={0}
                                step={1}
                                value={Number.isNaN(f.state.value) ? "" : f.state.value}
                                onBlur={f.handleBlur}
                                onChange={(e) => f.handleChange(e.target.valueAsNumber)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Field name="disponible">
                    {(f) => (
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
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

                <div className="flex justify-end gap-3 pt-2">
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
