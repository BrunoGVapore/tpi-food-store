export function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} aria-hidden="true" />;
}

// Grilla de tarjetas "fantasma" mientras carga el catálogo.
export function SkeletonGrilla({ cantidad = 8 }: { cantidad?: number }) {
    return (
        <div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-busy="true"
            aria-label="Cargando"
        >
            {Array.from({ length: cantidad }, (_, i) => (
                <div key={i} className="panel overflow-hidden">
                    <Skeleton className="h-40 rounded-none" />
                    <div className="space-y-3 p-4">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Filas "fantasma" para tablas y listas.
export function SkeletonFilas({ cantidad = 5 }: { cantidad?: number }) {
    return (
        <div className="panel space-y-3 p-4" aria-busy="true" aria-label="Cargando">
            {Array.from({ length: cantidad }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
            ))}
        </div>
    );
}
