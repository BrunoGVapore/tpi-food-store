import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Campo, Input, Textarea } from "@/shared/ui/Input";
import { primerError } from "@/shared/utils/formularios";
import { NOMBRE_FORMA_PAGO } from "../types/estados";
import type { FormaPago } from "../types/pedido";

export interface DatosCheckout {
    direccion_entrega: string;
    forma_pago: FormaPago;
    notas: string | null;
}

interface CheckoutFormProps {
    onSubmit: (datos: DatosCheckout) => Promise<void>;
}

const FORMAS_PAGO: FormaPago[] = ["EFECTIVO", "TRANSFERENCIA"];

const validarDireccion = (value: string) => {
    const largo = value.trim().length;
    if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
    if (largo > 200) return "La dirección no puede superar los 200 caracteres";
    return undefined;
};

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
    const form = useForm({
        defaultValues: { direccion_entrega: "", forma_pago: "EFECTIVO" as FormaPago, notas: "" },
        onSubmit: async ({ value }) => {
            await onSubmit({
                direccion_entrega: value.direccion_entrega.trim(),
                forma_pago: value.forma_pago,
                notas: value.notas.trim() || null,
            });
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-5"
            noValidate
        >
            <form.Field
                name="direccion_entrega"
                validators={{
                    onChange: ({ value }) => validarDireccion(value),
                    onBlur: ({ value }) => validarDireccion(value),
                }}
            >
                {(f) => (
                    <Campo id="checkout-direccion" label="Dirección de entrega" error={primerError(f.state.meta.errors)}>
                        <Input
                            id="checkout-direccion"
                            autoComplete="street-address"
                            placeholder="Calle, número, piso/depto y localidad"
                            value={f.state.value}
                            onBlur={f.handleBlur}
                            onChange={(e) => f.handleChange(e.target.value)}
                        />
                    </Campo>
                )}
            </form.Field>

            <form.Field name="forma_pago">
                {(f) => (
                    <fieldset>
                        <legend className="form-label">Forma de pago</legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {FORMAS_PAGO.map((forma) => (
                                <label
                                    key={forma}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                                        f.state.value === forma
                                            ? "border-brand bg-brand-soft ring-1 ring-brand"
                                            : "border-stone-300 hover:bg-stone-50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="forma_pago"
                                        value={forma}
                                        checked={f.state.value === forma}
                                        onChange={() => f.handleChange(forma)}
                                        className="accent-brand"
                                    />
                                    <span className="font-medium">
                                        {forma === "EFECTIVO" ? "💵" : "🏦"} {NOMBRE_FORMA_PAGO[forma]}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-stone-500">El pago se coordina al recibir el pedido (sin pasarela de pago).</p>
                    </fieldset>
                )}
            </form.Field>

            <form.Field
                name="notas"
                validators={{ onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined) }}
            >
                {(f) => (
                    <Campo id="checkout-notas" label="Notas (opcional)" error={primerError(f.state.meta.errors)}>
                        <Textarea
                            id="checkout-notas"
                            rows={3}
                            placeholder="Ej. Tocar el timbre 2B, sin cebolla..."
                            value={f.state.value}
                            onBlur={f.handleBlur}
                            onChange={(e) => f.handleChange(e.target.value)}
                        />
                    </Campo>
                )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                {([canSubmit, isSubmitting]) => (
                    <Button type="submit" className="w-full py-3 text-base" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    );
}
