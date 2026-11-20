import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

// Navbar fija y, debajo, la pantalla de la ruta activa.
export function MainLayout() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <Outlet />
            </main>
        </div>
    );
}
