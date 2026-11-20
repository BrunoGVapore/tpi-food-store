import { Link } from "react-router-dom";

export function UnauthorizedPage() {
    return (
        <div className="mx-auto max-w-md py-12">
            <div className="panel space-y-4 p-8 text-center">
                <div className="text-5xl" aria-hidden="true">
                    🔒
                </div>
                <h1 className="page-title">Sin permiso</h1>
                <p className="text-stone-600">No tenés permisos para acceder a esta sección.</p>
                <Link
                    to="/"
                    className="inline-block rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
