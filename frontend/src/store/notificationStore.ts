import { create } from "zustand";

export type NotificationType = "success" | "error" | "info";

interface NotificationStore {
    message: string;
    show: boolean;
    type: NotificationType;
    // Cambia en cada aviso: así el temporizador del Toast se reinicia
    // aunque llegue dos veces el mismo texto.
    id: number;
    showNotification: (message: string, type?: NotificationType) => void;
    hideNotification: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
    message: "",
    show: false,
    type: "info",
    id: 0,
    showNotification: (message, type = "info") =>
        set((state) => ({ message, type, show: true, id: state.id + 1 })),
    hideNotification: () => set({ message: "", show: false }),
}));
