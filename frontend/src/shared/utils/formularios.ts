// TanStack Form puede devolver el mismo error desde onChange y onBlur: se muestra el primero.
export function primerError(errores: readonly unknown[]): string | undefined {
    const primero = errores.find((e) => typeof e === "string" && e.length > 0);
    return typeof primero === "string" ? primero : undefined;
}
