import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = "" }: CardProps) {
    return <div className={`panel p-6 ${className}`}>{children}</div>;
}
