import type { ReactNode } from "react";

interface ModalProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
    error?: string | null;
    wide?: boolean;
}

export function Modal({ title, onClose, children, error, wide = false }: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`panel max-h-[90vh] w-full overflow-y-auto p-6 ${wide ? "max-w-2xl" : "max-w-md"}`}
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 className="text-xl font-bold text-stone-900">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="cursor-pointer text-2xl leading-none text-stone-400 hover:text-stone-700"
                    >
                        ×
                    </button>
                </div>
                {error && (
                    <div role="alert" className="alert-error mb-4">
                        {error}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
