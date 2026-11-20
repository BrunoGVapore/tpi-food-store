import { Button } from "@/shared/ui/Button";

interface EstadoErrorProps {
    mensaje: string;
    onReintentar?: () => void;
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
    return (
        <div role="alert" className="alert-error flex flex-wrap items-center justify-between gap-3 p-4">
            <span>{mensaje}</span>
            {onReintentar && (
                <Button variant="outline" size="sm" onClick={onReintentar}>
                    Reintentar
                </Button>
            )}
        </div>
    );
}
