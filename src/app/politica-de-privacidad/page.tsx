import { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { navItems } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Política de Privacidad | Buses Madrid",
  description:
    "Conoce cómo Buses Madrid protege tu información personal. Política de privacidad completa y transparente.",
  alternates: {
    canonical: "https://busesmadrid.cl/politica-de-privacidad",
  },
  openGraph: {
    title: "Política de Privacidad | Buses Madrid",
    description:
      "Conoce cómo Buses Madrid protege tu información personal. Política de privacidad completa y transparente.",
    url: "https://busesmadrid.cl/politica-de-privacidad",
    type: "website",
  },
};

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header space */}
      <div className="h-20" />

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introducción
            </h2>
            <p>
              Buses Madrid (nosotros, nuestro o nos) respeta la privacidad de
              nuestros usuarios (usuario o tú). Esta Política de Privacidad
              explica cómo recopilamos, usamos, divulgamos y protegemos tu
              información cuando visitas nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Información que Recopilamos
            </h2>
            <p>
              Recopilamos información que proporcionas voluntariamente, como:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre y apellido</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Información sobre tu empresa o negocio</li>
              <li>Mensaje o consulta específica</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Uso de la Información
            </h2>
            <p>
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responder a tus consultas e inquietudes</li>
              <li>Enviar información sobre nuestros servicios</li>
              <li>Procesar solicitudes de transporte y cotizaciones</li>
              <li>Mejorar nuestro sitio web y servicios</li>
              <li>Cumplir con obligaciones legales</li>
              <li>
                Contactarte para seguimiento sobre solicitudes realizadas
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Protección de Datos
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para
              proteger tu información personal contra acceso no autorizado,
              alteración, divulgación o destrucción. Sin embargo, ningún método
              de transmisión por Internet es 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Compartir Información
            </h2>
            <p>
              No vendemos, comercializamos ni transferimos tu información
              personal a terceros sin tu consentimiento, excepto:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Cuando sea requerido por ley o para proteger nuestros derechos
              </li>
              <li>
                A proveedores de servicios que mantienen la confidencialidad
              </li>
              <li>Con tu consentimiento explícito</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Cookies
            </h2>
            <p>
              Nuestro sitio puede utilizar cookies para mejorar tu experiencia.
              Las cookies son archivos pequeños que se almacenan en tu
              dispositivo. Puedes controlar las cookies a través de la
              configuración de tu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Tus Derechos
            </h2>
            <p>
              Tienes derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a tu información personal</li>
              <li>Solicitar la corrección de datos inexactos</li>
              <li>Solicitar la eliminación de tu información</li>
              <li>Optar por no recibir comunicaciones de marketing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre esta Política de Privacidad, contáctanos
              en:
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Email:</strong> busesmadrid@gmail.com
              </li>
              <li>
                <strong>Teléfono:</strong> +56 9 7486850
              </li>
              <li>
                <strong>Dirección:</strong> Jotabeche 811, Estación Central,
                Santiago, Chile
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Cambios a esta Política
            </h2>
            <p>
              Nos reservamos el derecho de modificar esta Política de Privacidad
              en cualquier momento. Los cambios entrarán en vigor inmediatamente
              después de su publicación.
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Última actualización: Abril 2026
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <SiteFooter navItems={navItems} />
    </div>
  );
}
