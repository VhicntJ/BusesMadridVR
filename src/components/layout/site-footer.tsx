import Image from "next/image";
import Link from "next/link";
import {
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
};

type SiteFooterProps = {
  navItems: readonly NavItem[];
};

export function SiteFooter({ navItems }: SiteFooterProps) {
  return (
    <footer className="brand-surface brand-on-surface w-full border-t border-slate-200 py-10 md:py-16">
      <div className="container-pro mb-8 md:mb-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold md:text-lg">
              <Image
                src="/images/fotos/LOGO-BUSES-MADRID.png"
                alt="Logo Buses Madrid"
                width={180}
                height={54}
                className="h-9 w-auto object-contain md:h-11"
              />
            </h3>
            <p className="brand-on-surface-muted mt-3 max-w-sm text-sm leading-relaxed md:mt-4">
              Transporte corporativo de excelencia en Chile. Más de 35 años conectando
              personas con seguridad, puntualidad y confort.
            </p>
          </div>

          <div>
            <h4 className="brand-on-surface-muted text-xs font-bold uppercase tracking-[0.2em] md:text-sm">
              Servicios
            </h4>
            <ul className="brand-on-surface-muted mt-3 space-y-1.5 text-sm md:mt-4 md:space-y-2">
              <li>
                <Link href="#servicios" className="hover:text-primary transition-colors">
                  Empresas y Privados
                </Link>
              </li>
              <li>
                <Link href="#servicios" className="hover:text-primary transition-colors">
                  Transporte Minero
                </Link>
              </li>
              <li>
                <Link href="#servicios" className="hover:text-primary transition-colors">
                  Arriendo de Flotas
                </Link>
              </li>
              <li>
                <Link href="#servicios" className="hover:text-primary transition-colors">
                  Transportes Especiales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="brand-on-surface-muted text-xs font-bold uppercase tracking-[0.2em] md:text-sm">
              Navegación
            </h4>
            <ul className="brand-on-surface-muted mt-3 space-y-1.5 text-sm md:mt-4 md:space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-slate-700/70 pt-3 md:mt-6 md:pt-4">
              <h5 className="brand-on-surface-muted text-[11px] font-bold uppercase tracking-[0.2em]">
                Legal
              </h5>
              <ul className="brand-on-surface-muted mt-2 space-y-1.5 text-sm md:mt-3 md:space-y-2">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Términos y condiciones
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="brand-on-surface-muted text-xs font-bold uppercase tracking-[0.2em] md:text-sm">
              Contacto
            </h4>
            <div className="brand-on-surface-muted mt-3 space-y-2 text-sm md:mt-4 md:space-y-3">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +56 9 XXXX XXXX
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                contacto@busesmadrid.cl
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                cotizacion@busesmadrid.cl
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Santiago, Chile
              </p>
            </div>
            <div className="mt-3 flex gap-2.5 md:mt-4 md:gap-3">
              <a
                href="#"
                className="brand-surface-2 brand-on-surface-muted inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-primary hover:text-slate-950 transition-colors"
                aria-label="LinkedIn"
              >
                <Globe2 className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="brand-surface-2 brand-on-surface-muted inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-primary hover:text-slate-950 transition-colors"
                aria-label="Facebook"
              >
                <Users className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="brand-surface-border border-t">
        <div className="container-pro brand-on-surface-muted py-4 text-center text-xs md:py-6 md:text-sm">
          <p>© {new Date().getFullYear()} Buses Madrid. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
