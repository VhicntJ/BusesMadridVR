import type { Metadata } from "next";

import { CareersLanding } from "@/components/sections/careers-landing";

export const metadata: Metadata = {
  title: "Trabaja con nosotros",
  description:
    "Conoce la cultura de Buses Madrid, mira fotos y material audiovisual del equipo y postula a una de nuestras vacantes.",
  alternates: {
    canonical: "/trabaja-con-nosotros",
  },
  openGraph: {
    title: "Trabaja con nosotros | BUSES MADRID",
    description:
      "Una landing dedicada para mostrar cómo es trabajar en Buses Madrid y facilitar tu postulación.",
    url: "https://busesmadrid.cl/trabaja-con-nosotros",
    images: [
      {
        url: "/images/fotos/Exterior.webp",
        width: 1200,
        height: 630,
        alt: "Trabaja con nosotros en BUSES MADRID",
      },
    ],
  },
};

export default function TrabajaConNosotrosPage() {
  return <CareersLanding />;
}