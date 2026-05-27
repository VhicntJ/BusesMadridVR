// src/lib/validation-schemas.ts
import { z } from "zod";

/**
 * Schema para validación de correo de contacto
 */
export const contactFormSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido").max(100),
  correo: z.string().email("Ingrese un correo válido"),
  telefono: z.string().min(9, "Ingrese un teléfono válido").max(20),
  asunto: z.string().min(5, "El asunto debe tener al menos 5 caracteres").max(200),
  mensaje: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(5000),
  recaptchaToken: z.string().min(1, "reCAPTCHA verification failed"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Schema para validación de postulación a trabajo
 */
export const jobApplicationSchema = z.object({
  nombres: z.string().min(2, "El nombre es requerido").max(100),
  apellidos: z.string().min(2, "El apellido es requerido").max(100),
  rut: z.string().min(1, "Ingrese un RUT válido"),
  correo: z.string().email("Ingrese un correo válido"),
  telefono: z.string().min(1, "Ingrese un teléfono válido"),
  region: z.string().min(1, "Seleccione una región"),
  comuna: z.string().min(1, "Seleccione una comuna"),
  licencia: z.string().min(1, "Seleccione tipo de licencia"),
  cargo: z.string().min(1, "Seleccione un cargo"),
  experiencia: z.string().min(1, "Seleccione años de experiencia"),
  trabajado_antes: z.string().min(1, "Responda si ha trabajado en Buses Madrid"),
  disponibilidad: z.string().min(1, "Seleccione disponibilidad de trabajo"),
  experiencia_detalle: z
    .string()
    .min(20, "Describa brevemente su experiencia (mínimo 20 caracteres)")
    .max(2000),
  recaptchaToken: z.string().min(1, "reCAPTCHA verification failed"),
});

export type JobApplicationData = z.infer<typeof jobApplicationSchema>;
