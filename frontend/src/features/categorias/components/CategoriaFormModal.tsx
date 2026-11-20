import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Campo, Input, Textarea } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { primerError } from "@/shared/utils/formularios";
import type { Categoria, CategoriaInput } from "../types/categoria";

interface CategoriaFormModalProps {
    categoria: Categoria | null; // null = alta
    error: string | null;
    onClose: () => void;
    onSubmit: (datos: CategoriaInput) => Promise<void>;
}

function validarNombre(value: string) {
    const largo = value.trim().length;
    if (largo < 2) return "El nombre debe tener al menos 2 caracteres";
    if (largo > 100) return "El nombre no puede superar los 100 caracteres";
    return undefined;
}

export function CategoriaFormModal({ categoria, error, onClose, onSubmit }: CategoriaFormModalProps) {
    const form = useForm({
        defaultValues: {
            nombre: categoria?.nombre ?? "",
            descripcion: categoria?.descripcion ?? "",
        },
        onSubmit: async ({ value }) => {
            const descripcion = value.descripcion.trim();
            await onSubmit({ nombre: value.nombre.trim(), descripcion: descripcion || null });
        },
    });

    return (
        <Modal title={categoria ? "Editar categoría" : "Nueva categoría"} onClose={onClose} error={error}>
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
                    name="nombre"
                    validators={{
                        onChange: ({ value }) => validarNombre(value),
                        onBlur: ({ value }) => validarNombre(value),
                    }}
                >
                    {(f) => (
                        <Campo id="cat-nombre" label="Nombre" error={primerError(f.state.meta.errors)}>
                            <Input
                                id="cat-nombre"
                                placeholder="Ej. Pizzas"
                                value={f.state.value}
                                onBlur={f.handleBlur}
                                onChange={(e) => f.handleChange(e.target.value)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Field
                    name="descripcion"
                    validators={{
                        onChange: ({ value }) =>
                            value.length > 500 ? "Máximo 500 caracteres" : undefined,
                    }}
                >
                    {(f) => (
                        <Campo id="cat-descripcion" label="Descripción (opcional)" error={primerError(f.state.meta.errors)}>
                            <Textarea
                                id="cat-descripcion"
                                rows={3}
                                placeholder="Ej. Pizzas a la piedra"
                                value={f.state.value}
                                onBlur={f.handleBlur}
                                onChange={(e) => f.handleChange(e.target.value)}
                            />
                        </Campo>
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
