import {
  BadgeCheck,
  Bus,
  Building2,
  Globe2,
  Medal,
  Mountain,
  Route,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

export const navItems = [
  { label: "Servicios", href: "#servicios" },
  { label: "Flota", href: "#flota" },
  { label: "Calidad", href: "#calidad" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Clientes", href: "#clientes" },
  { label: "Contacto", href: "#contacto" },
] as const;

export const services = [
  {
    title: "Servicio de Empresas o Privados",
    description: "Traslados programados para equipos corporativos y eventos particulares.",
    icon: Building2,
    image: "/images/fotos/IMG_0770.webp",
    badge: "Corporativo",
    teaser: "Traslados internos y por turnos con foco en cumplimiento operacional.",
  },
  {
    title: "Transporte de Pasajeros",
    description: "Rutas seguras de media y larga distancia con alto estándar de confort.",
    icon: Users,
    image: "/images/fotos/IMG_9163.webp",
    badge: "Interurbano",
    teaser: "Rutas seguras de media y larga distancia con comodidad total.",
  },
  {
    title: "Transportes Especiales",
    description: "Operaciones a medida para faenas, eventos masivos y requerimientos técnicos.",
    icon: Route,
    image: "/images/fotos/Exterior-2.webp",
    badge: "Flexible",
    teaser: "Cobertura para faenas, eventos y requerimientos de alta demanda.",
  },
  {
    title: "Arriendo de Flotas",
    description: "Disponibilidad flexible de buses, minibuses y vans para periodos definidos.",
    icon: Bus,
    image: "/images/fotos/IMG_9167.webp",
    badge: "Operaciones",
    teaser: "Flotas modernas para proyectos corporativos y mineros.",
  },
  {
    title: "Transportes Mineros",
    description: "Servicios para altura y turnos complejos con protocolos mineros exigentes.",
    icon: Mountain,
    image: "/images/fotos/Exterior.webp",
    badge: "Minería",
    teaser: "Protocolos mineros, seguridad reforzada y continuidad operacional.",
  },
  {
    title: "Instituciones Deportivas",
    description: "Movilidad para delegaciones, academias y clubes en todo Chile.",
    icon: Trophy,
    image: "/images/fotos/IMG_0195.webp",
    badge: "Deportivo",
    teaser: "Planificación logística para traslados deportivos en todo Chile.",
  },
] as const;

export const features = [
  { title: "Conductores con experiencia y certificación", icon: ShieldCheck },
  { title: "Control vía satelital GPS", icon: Globe2 },
  { title: "Más de 35 años de experiencia", icon: Medal },
  { title: "Moderna flota de vehículos", icon: BadgeCheck },
] as const;

export const fleet = [
  {
    title: "Bus Semicama",
    image: "/images/fotos/IMG_0770.webp",
    capacity: "44 pasajeros",
    use: "Corporativo e interurbano",
  },
  {
    title: "Bus Estándar Minero",
    image: "/images/fotos/IMG_9167.webp",
    capacity: "42 pasajeros",
    use: "Faena minera",
  },
  {
    title: "Sprinter Ejecutivo",
    image: "/images/fotos/IMG_9163.webp",
    capacity: "16 pasajeros",
    use: "Traslado ejecutivo",
  },
  {
    title: "Bus Cama",
    image: "/images/fotos/Exterior-2.webp",
    capacity: "40 pasajeros",
    use: "Larga distancia",
  },
  {
    title: "Mini Bus Minero",
    image: "/images/fotos/Exterior.webp",
    capacity: "24 pasajeros",
    use: "Turnos especiales",
  },
  {
    title: "Mercedes Vito",
    image: "/images/fotos/VITO-1.jpg",
    capacity: "8 pasajeros",
    use: "Operaciones VIP",
  },
] as const;

export const clientLogos = [
  { name: "Cliente 1", image: "/images/fotos/1.png" },
  { name: "Cliente 2", image: "/images/fotos/2.png" },
  { name: "Cliente 3", image: "/images/fotos/3.png" },
  { name: "Cliente 4", image: "/images/fotos/4.png" },
  { name: "Cliente 5", image: "/images/fotos/5.png" },
  { name: "Cliente 6", image: "/images/fotos/6.png" },
  { name: "Cliente 7", image: "/images/fotos/7.png" },
  { name: "Cliente 8", image: "/images/fotos/8.png" },
] as const;

export const stats = [
  { value: "35+", label: "años de experiencia" },
  { value: "50+", label: "empresas clientes" },
  { value: "10.000+", label: "pasajeros diarios" },
  { value: "30+", label: "años en transporte minero" },
] as const;

export const heroServices = services.map((service) => ({
  title: service.title,
  description: service.description,
  teaser: service.teaser,
  image: service.image,
  href: "#servicios",
}));
