import { useEffect } from "react";
import { useNotificationStore, type NotificationType } from "@/store/notificationStore";

const estilos: Record<NotificationType, string> = {
    success: "bg-success",
    error: "bg-error",
    info: "bg-stone-800",
};

// Se monta una sola vez (App.tsx). Los hooks muestran avisos con showNotification.
export function Toast() {
    const message = useNotificationStore((state) => state.message);
    const show = useNotificationStore((state) => state.show);
    const type = useNotificationStore((state) => state.type);
    const id = useNotificationStore((state) => state.id);
    const hideNotification = useNotificationStore((state) => state.hideNotification);

    useEffect(() => {
        if (!show) return;
        const timer = setTimeout(hideNotification, 3500);
        return () => clearTimeout(timer);
    }, [show, id, hideNotification]);

    if (!show) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${estilos[type]}`}
        >
            <span className="flex-1">{message}</span>
            <button
                type="button"
                onClick={hideNotification}
                aria-label="Cerrar notificación"
                className="cursor-pointer font-bold opacity-80 hover:opacity-100"
            >
                ×
            </button>
        </div>
    );
}
