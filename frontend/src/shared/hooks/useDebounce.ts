import { useEffect, useState } from "react";

// Devuelve el valor recién cuando dejó de cambiar durante "delay" ms
// (evita una petición por cada tecla en el buscador).
export function useDebounce<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
