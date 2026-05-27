import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
import { WebVitalsProvider } from "@/components/providers/web-vitals-provider";
import { RecaptchaProvider } from "@/components/providers/recaptcha-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://busesmadrid.cl"),
  title: {
    default: "Buses Madrid | Transporte Corporativo en Chile",
    template: "%s | Buses Madrid",
  },
  description:
    "Empresa chilena de transporte de pasajeros con más de 35 años de experiencia en servicios corporativos, mineros, privados y especiales.",
  keywords: [
    "Buses Madrid",
    "transporte de pasajeros Chile",
    "transporte corporativo",
    "transporte minero",
    "arriendo de buses",
    "traslado de personal",
  ],
  category: "transport",
  applicationName: "Buses Madrid",
  referrer: "origin-when-cross-origin",
  creator: "Buses Madrid",
  publisher: "Buses Madrid",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Buses Madrid - Transporte en Chile",
    description:
      "Más de 35 años ofreciendo transporte seguro, puntual y confortable en todo Chile.",
    url: "https://busesmadrid.cl",
    siteName: "Buses Madrid",
    locale: "es_CL",
    type: "website",
    images: [
      {
        url: "/images/fotos/IMG_0770.webp",
        width: 1200,
        height: 630,
        alt: "Buses Madrid - Transporte en Chile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buses Madrid - Transporte en Chile",
    description:
      "Más de 35 años ofreciendo transporte seguro, puntual y confortable en todo Chile.",
    images: ["/images/fotos/IMG_0770.webp"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CL"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WebVitalsProvider />
        <RecaptchaProvider>
          {children}
        </RecaptchaProvider>
      </body>
    </html>
  );
}
