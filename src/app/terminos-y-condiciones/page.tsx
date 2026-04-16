import { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { navItems } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Buses Madrid",
  description:
    "Lee nuestros términos y condiciones de uso de servicios de transporte y sitio web.",
  alternates: {
    canonical: "https://busesmadrid.cl/terminos-y-condiciones",
  },
  openGraph: {
    title: "Términos y Condiciones | Buses Madrid",
    description:
      "Lee nuestros términos y condiciones de uso de servicios de transporte y sitio web.",
    url: "https://busesmadrid.cl/terminos-y-condiciones",
    type: "website",
  },
};

export default function TerminosCondiciones() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header space */}
      <div className="h-20" />

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Términos y Condiciones
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Aceptación de Términos
            </h2>
            <p>
              Al acceder y utilizar este sitio web y nuestros servicios de
              transporte, aceptas estos Términos y Condiciones. Si no estás de
              acuerdo con alguna parte, por favor no uses nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Uso Autorizado
            </h2>
            <p>
              Te comprometes a utilizar este sitio web y nuestros servicios solo
              para propósitos legales. No debes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Usar contenido para actividades ilegales o fraudulentas
              </li>
              <li>
                Intentar obtener acceso no autorizado a sistemas o información
              </li>
              <li>Realizar interferencias con el funcionamiento del sitio</li>
              <li>Violar derechos de terceros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Servicios de Transporte
            </h2>
            <p>
              Buses Madrid ofrece servicios de transporte de pasajeros
              corporativo, minero, y general en Chile. Los servicios se
              proporcionan según lo acordado en contrato separado.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El cliente debe proporcionar la información requerida</li>
              <li>El transporte debe cumplir con horarios acordados</li>
              <li>
                Se aplican políticas de cancelación según contrato vigente
              </li>
              <li>El cliente es responsable de pasajeros y equipaje</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Precios y Pagos
            </h2>
            <p>
              Los precios de nuestros servicios son cotizados según
              especificaciones del cliente. Se aceptan los siguientes métodos de
              pago:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Transferencia bancaria</li>
              <li>Cheque</li>
              <li>Efectivo</li>
              <li>Otros métodos acordados por escrito</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              Las facturas deben pagarse dentro del plazo indicado. Por pagos
              atrasados se aplicarán recargos según documentos contractuales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Cancelaciones y Cambios
            </h2>
            <p>
              Las cancelaciones o cambios de servicios deben solicitarse con
              anticipación según condiciones:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Cancelación con 7 días de anticipación: reembolso del 100%
              </li>
              <li>
                Cancelación con 3-7 días: descuento del 50% de la tarifa
              </li>
              <li>Cancelación menor a 3 días: sin reembolso o cambio completo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Responsabilidades del Cliente
            </h2>
            <p>
              El cliente acepta:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar información correcta y completa</li>
              <li>Cumplir con regulaciones legales de seguridad</li>
              <li>
                Supervisar a pasajeros y asegurar comportamiento apropiado
              </li>
              <li>
                No transportar sustancias peligrosas sin autorización
              </li>
              <li>Pagar las tarifas en tiempo y forma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Limitación de Responsabilidad
            </h2>
            <p>
              Buses Madrid no será responsable por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Daños indirectos, incidentales o consecuentes</li>
              <li>Pérdida de información o datos</li>
              <li>Interrupciones de servicio por fuerza mayor</li>
              <li>Acciones de terceros fuera de nuestro control</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              La responsabilidad máxima de Buses Madrid se limita al valor de
              los servicios prestados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Propiedad Intelectual
            </h2>
            <p>
              Todo contenido de este sitio web, incluyendo textos, imágenes,
              logotipos y diseño, es propiedad de Buses Madrid o de sus
              licenciadores. No está permitida su reproducción sin autorización
              escrita.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Enlaces Externos
            </h2>
            <p>
              Nuestro sitio web puede contener enlaces a sitios de terceros.
              Buses Madrid no es responsable del contenido, precisión o prácticas
              de estos sitios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Modificaciones de Términos
            </h2>
            <p>
              Buses Madrid se reserva el derecho de modificar estos términos en
              cualquier momento. El uso continuado del sitio o servicios
              constituye aceptación de los términos modificados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Ley Aplicable
            </h2>
            <p>
              Estos Términos y Condiciones se rigen por las leyes de la
              República de Chile. Cualquier disputa será resuelta en los
              tribunales competentes de Santiago, Chile.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contacto
            </h2>
            <p>
              Para preguntas sobre estos Términos y Condiciones, contáctanos en:
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
            <p className="text-sm text-gray-600 mt-8">
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
