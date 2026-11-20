import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Campo, Input } from "@/shared/ui/Input";
import { primerError } from "@/shared/utils/formularios";
import type { RegisterInput } from "../types/auth";

interface RegisterFormProps {
    onSubmit: (datos: RegisterInput) => Promise<void>;
}

const valoresIniciales: RegisterInput = { username: "", full_name: "", email: "", password: "" };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarUsername(value: string) {
    const limpio = value.trim();
    if (limpio.length < 3) return "El usuario debe tener al menos 3 caracteres";
    if (limpio.length > 50) return "El usuario no puede superar los 50 caracteres";
    return undefined;
}

function validarNombre(value: string) {
    return value.trim() ? undefined : "Ingresá tu nombre y apellido";
}

function validarEmail(value: string) {
    return EMAIL_REGEX.test(value.trim()) ? undefined : "Ingresá un email válido";
}

function validarPassword(value: string) {
    if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (new TextEncoder().encode(value).length > 72) return "La contraseña no puede superar los 72 bytes";
    return undefined;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
    const form = useForm({
        defaultValues: valoresIniciales,
        onSubmit: async ({ value }) => {
            await onSubmit({
                username: value.username.trim(),
                full_name: value.full_name.trim(),
                email: value.email.trim(),
                password: value.password,
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
            className="space-y-4"
            noValidate
        >
            <form.Field
                name="username"
                validators={{
                    onChange: ({ value }) => validarUsername(value),
                    onBlur: ({ value }) => validarUsername(value),
                }}
            >
                {(f) => (
                    <Campo id="reg-username" label="Nombre de usuario" error={primerError(f.state.meta.errors)}>
                        <Input
                            id="reg-username"
                            autoComplete="username"
                            placeholder="Ej. ana"
                            value={f.state.value}
                            onBlur={f.handleBlur}
                            onChange={(e) => f.handleChange(e.target.value)}
                        />
                    </Campo>
                )}
            </form.Field>

            <form.Field
                name="full_name"
                validators={{
                    onChange: ({ value }) => validarNombre(value),
                    onBlur: ({ value }) => validarNombre(value),
                }}
            >
                {(f) => (
                    <Campo id="reg-nombre" label="Nombre y apellido" error={primerError(f.state.meta.errors)}>
                        <Input
                            id="reg-nombre"
                            autoComplete="name"
                            placeholder="Ej. Ana Pérez"
                            value={f.state.value}
                            onBlur={f.handleBlur}
                            onChange={(e) => f.handleChange(e.target.value)}
                        />
                    </Campo>
                )}
            </form.Field>

            <form.Field
                name="email"
                validators={{
                    onChange: ({ value }) => validarEmail(value),
                    onBlur: ({ value }) => validarEmail(value),
                }}
            >
                {(f) => (
                    <Campo id="reg-email" label="Email" error={primerError(f.state.meta.errors)}>
                        <Input
                            id="reg-email"
                            type="email"
                            autoComplete="email"
                            placeholder="Ej. ana@example.com"
                            value={f.state.value}
                            onBlur={f.handleBlur}
                            onChange={(e) => f.handleChange(e.target.value)}
                        />
                    </Campo>
                )}
            </form.Field>

            <form.Field
                name="password"
                validators={{
                    onChange: ({ value }) => validarPassword(value),
                    onBlur: ({ value }) => validarPassword(value),
                }}
            >
                {(f) => (
                    <Campo id="reg-password" label="Contraseña" error={primerError(f.state.meta.errors)}>
                        <Input
                            id="reg-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Mínimo 8 caracteres"
                            value={f.state.value}
                            onBlur={f.handleBlur}
                            onChange={(e) => f.handleChange(e.target.value)}
                        />
                    </Campo>
                )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                {([canSubmit, isSubmitting]) => (
                    <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    );
}
