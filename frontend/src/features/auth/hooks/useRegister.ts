import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth";

// Registro público: crea un usuario con rol "user".
export function useRegister() {
    return useMutation({ mutationFn: register });
}
