import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Campo, Input } from "@/shared/ui/Input";
import { primerError } from "@/shared/utils/formularios";
import type { LoginCredentials } from "../types/auth";

interface LoginFormProps {
    onSubmit: (credenciales: LoginCredentials) => Promise<void>;
}

const valoresIniciales: LoginCredentials = { username: "", password: "" };

export function LoginForm({ onSubmit }: LoginFormProps) {
    const form = useForm({
        defaultValues: valoresIniciales,
        onSubmit: async ({ value }) => {
            await onSubmit({ username: value.username.trim(), password: value.password });
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
                    onChange: ({ value }) => (!value.trim() ? "Ingresá tu usuario" : undefined),
                    onBlur: ({ value }) => (!value.trim() ? "Ingresá tu usuario" : undefined),
                }}
            >
                {(f) => (
                    <Campo id="login-username" label="Usuario" error={primerError(f.state.meta.errors)}>
                        <Input
                            id="login-username"
                            autoComplete="username"
                            placeholder="Tu nombre de usuario"
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
                    onChange: ({ value }) => (!value ? "Ingresá tu contraseña" : undefined),
                    onBlur: ({ value }) => (!value ? "Ingresá tu contraseña" : undefined),
                }}
            >
                {(f) => (
                    <Campo id="login-password" label="Contraseña" error={primerError(f.state.meta.errors)}>
                        <Input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Tu contraseña"
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
                        {isSubmitting ? "Ingresando..." : "Ingresar"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    );
}
