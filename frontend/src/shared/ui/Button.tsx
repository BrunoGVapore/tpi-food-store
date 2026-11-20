import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantes: Record<ButtonVariant, string> = {
    primary: "bg-brand text-white hover:bg-brand-hover",
    secondary: "bg-stone-800 text-white hover:bg-stone-700",
    outline: "border border-stone-300 bg-white text-stone-700 hover:bg-stone-100",
    danger: "bg-error text-white hover:bg-red-700",
    ghost: "text-stone-600 hover:bg-stone-100",
};

const tamanios: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
};

export function Button({
    variant = "primary",
    size = "md",
    type = "button",
    className = "",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variantes[variant]} ${tamanios[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
