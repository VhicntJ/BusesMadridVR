import type { Metadata } from "next";
import Image from "next/image";
import {
  Globe2,
  HeartHandshake,
  Timer,
} from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { Reveal } from "@/components/motion/reveal";
import { BrandsCarousel } from "@/components/sections/brands-carousel";
import { ContactForm } from "@/components/sections/contact-form";
import { FleetShowcase } from "@/components/sections/fleet-showcase";
import { HeroVideo } from "@/components/sections/hero-video";
import { SectionHeading } from "@/components/sections/section-heading";
import { ServicesGrid } from "@/components/sections/services-grid";
import { StatsSection } from "@/components/sections/stats-section";
import { Navbar } from "@/components/ui/navbar";
import { ThemeVariantSwitcher } from "@/components/ui/theme-variant-switcher";
import { VideoOperationsSection } from "@/components/sections/video-operations-section";
import {
  clientLogos,
  features,
  fleet,
  heroServices,
  navItems,
  services,
  stats,
} from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Buses Madrid - Transporte en Chile",
  description:
    "Más de 35 años ofreciendo transporte seguro, puntual y confortable para empresas, minería, instituciones y servicios privados en Chile.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Buses Madrid - Transporte en Chile",
    description:
      "Conectamos personas y empresas con una flota moderna, conductores certificados y monitoreo GPS.",
    url: "https://busesmadrid.cl",
    images: [
      {
        url: "/images/fotos/IMG_0770.webp",
        width: 1200,
        height: 630,
        alt: "Flota de Buses Madrid en Chile",
      },
    ],
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Buses Madrid",
        url: "https://busesmadrid.cl",
        logo: "https://busesmadrid.cl/images/fotos/LOGO-BUSES-MADRID.png",
        sameAs: ["https://wa.me/56974868550"],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+56-9-7486850",
          contactType: "Customer Support",
          email: "busesmadrid@gmail.com",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Jotabeche 811",
          addressLocality: "Santiago",
          addressRegion: "Región Metropolitana",
          postalCode: "8340000",
          addressCountry: "CL",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://busesmadrid.cl/#localbusiness",
        name: "Buses Madrid",
        image: "https://busesmadrid.cl/images/fotos/IMG_0770.webp",
        url: "https://busesmadrid.cl",
        telephone: "+56-9-7486850",
        email: "busesmadrid@gmail.com",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Jotabeche 811, Estación Central",
          addressLocality: "Santiago",
          addressRegion: "Región Metropolitana",
          postalCode: "8340000",
          addressCountry: "CL",
        },
        areaServed: "Chile",
        serviceType: [
          "Transporte corporativo",
          "Transporte minero",
          "Transporte de pasajeros",
          "Arriendo de flotas",
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar items={navItems} />
      <ThemeVariantSwitcher />

      <HeroVideo
        title="Buses Madrid"
        subtitle="Más de 35 años ofreciendo transporte seguro, puntual y confortable. Transportamos personas, empresas e industrias con excelencia operacional."
        videoSrc="/images/fotos/Buses-Madrid-Minera-la-florida.mp4"
        services={heroServices}
        ctaButtons={[
          { label: "Cotizar", href: "#contacto", variant: "default" },
          { label: "Ver Servicios", href: "#servicios", variant: "secondary" },
        ]}
      />

      <section id="servicios-intro" className="w-full bg-white py-20">
        <div className="container-pro">
          <div className="grid gap-12 md:grid-cols-2">
            <Reveal>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Nuestro Propósito
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                  Conectar a las personas con sus lugares
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Movilizamos personas entre los lugares más importantes de su vida: hogar,
                  trabajo y destinos clave. Somos el nexo confiable en cada trayecto.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Nuestra Misión
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                  Transporte seguro y confortable
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Transportamos tu gente en forma segura, puntual y confortable.
                  Contribuimos a su calidad de vida mediante operaciones de excelencia y
                  responsabilidad social corporativa.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="servicios" className="container-pro py-20">
        <SectionHeading
          title="¿Qué hacemos?"
          description="Soluciones de transporte integral para empresas, industrias y personas que demandan seguridad, puntualidad y confort."
        />
        <ServicesGrid services={services} />
      </section>

      <StatsSection
        id="somos-buses-madrid"
        title="SOMOS BUSES MADRID"
        stats={[
          { value: "35+", label: "años de experiencia" },
          { value: "100%", label: "flota moderna" },
          { value: "24/7", label: "monitoreo GPS" },
          { value: "99%", label: "puntualidad" },
          { value: "50+", label: "empresas clientes" },
          { value: "10.000+", label: "pasajeros diarios" },
        ]}
      />

      <VideoOperationsSection id="operaciones-modernas" />

      <section id="flota" className="w-full bg-slate-50 py-20">
        <div className="container-pro">
          <SectionHeading
            title="Nuestra Flota"
            description="Vehículos modernos especializados para cada requerimiento: capacidad, confort y seguridad operacional."
          />
          <FleetShowcase fleet={fleet} />
        </div>
      </section>

      <section id="calidad" className="container-pro pt-20">
        <SectionHeading
          title="Calidad Buses Madrid"
          description="Priorizamos puntualidad, limpieza y calidad para ofrecer un servicio de transporte excepcional."
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 0.06}>
                <div className="h-full rounded-xl bg-gradient-to-br from-white to-blue-50/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="nosotros" className="container-pro pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Sobre Buses Madrid
            </h2>
            <p className="mt-4 text-slate-600">
              Llevamos más de tres décadas conectando personas, empresas e industrias con
              operaciones confiables. En Buses Madrid integramos seguridad, puntualidad y
              confort en cada jornada.
            </p>
            <p className="mt-4 text-slate-600">
              Nuestro compromiso es desarrollar servicios en armonía con criterios ASG
              (Ambiente, Sociedad y Gobierno), asegurando continuidad operacional mientras
              cuidamos el bienestar social y ambiental.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nuestra trayectoria
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {stats.slice(0, 4).map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-[11px] font-semibold uppercase text-slate-700">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative h-72 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-100 to-slate-100 shadow-md">
              <Image
                src="/images/fotos/IMG_0195.webp"
                alt="Equipo de Buses Madrid"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="clientes" className="w-full bg-slate-50 py-20">
        <div className="container-pro">
          <SectionHeading
            title="Confían en nosotros"
            description="Empresas líderes en distintas industrias nos eligen para sus soluciones de transporte corporativo, minero y especial."
            centered
          />

          <div className="mt-12">
            <Reveal>
              <BrandsCarousel brands={clientLogos} />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="contacto" className="container-pro pt-20 pb-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                ¿Necesitas transporte?
              </h2>
              <p className="mt-4 text-slate-600">
                Cuéntanos tu requerimiento y te enviaremos una propuesta personalizada.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <HeartHandshake className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-slate-900">Asesoría personalizada</p>
                    <p className="text-sm text-slate-600">Analizamos tu caso específico</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-slate-900">Cobertura nacional</p>
                    <p className="text-sm text-slate-600">Operamos en todo Chile</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Timer className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-slate-900">Respuesta rápida</p>
                    <p className="text-sm text-slate-600">Te contactamos al día siguiente</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <SiteFooter navItems={navItems} />
    </>
  );
}
