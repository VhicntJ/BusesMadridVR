import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="text-center">
        <h1 className="text-7xl font-black text-white drop-shadow-lg">404</h1>
        <p className="mt-4 text-xl font-semibold text-slate-200">
          Página no encontrada
        </p>
        <p className="mt-2 max-w-md text-slate-400">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-10 bottom-20 h-64 w-64 rounded-full bg-amber-300/5 blur-3xl" />
      </div>
    </div>
  );
}
