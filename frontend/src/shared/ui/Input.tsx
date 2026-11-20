import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface CampoProps {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}

// Envoltorio común: etiqueta, control y mensaje de error.
export function Campo({ id, label, error, children }: CampoProps) {
    return (
        <div>
            <label htmlFor={id} className="form-label">
                {label}
            </label>
            {children}
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return <input className={`form-input ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return <select className={`form-input ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea className={`form-input ${className}`} {...props} />;
}
