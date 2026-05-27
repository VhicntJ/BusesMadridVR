"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircleMore, SendHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";

const contactSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  correo: z.string().email("Ingresa un email válido"),
  telefono: z.string().min(9, "Ingresa un teléfono válido"),
  asunto: z.string().min(5, "Ingresa un asunto válido"),
  mensaje: z.string().min(10, "Escribe un mensaje más detallado"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [toast, setToast] = useState<{ variant: "success" | "error"; message: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setToast(null);

    try {
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA no está disponible");
      }

      const recaptchaToken = await executeRecaptcha("contact");

      const response = await fetch("/api/send-contact-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el mensaje");
      }

      setToast({ variant: "success", message: "Mensaje enviado correctamente." });
      reset();
      console.log("✅ Mensaje enviado correctamente");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setToast({ variant: "error", message: errorMessage });
      console.error("❌ Error:", errorMessage);
    }
  };

  return (
    <Card className="bg-white/85">
      <CardHeader>
        <CardTitle>Solicita una cotización</CardTitle>
        <CardDescription>
          Te responderemos a la brevedad con una propuesta personalizada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {toast ? (
            <Toast
              variant={toast.variant}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          ) : null}

          <div className="grid gap-2">
            <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
              Nombre
            </label>
            <Input id="nombre" placeholder="Nombre completo" {...register("nombre")} />
            {errors.nombre ? (
              <p className="text-sm text-red-600">{errors.nombre.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <label htmlFor="correo" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                id="correo"
                type="email"
                placeholder="contacto@empresa.cl"
                {...register("correo")}
              />
              {errors.correo ? (
                <p className="text-sm text-red-600">{errors.correo.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label htmlFor="telefono" className="text-sm font-medium text-slate-700">
                Teléfono
              </label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+56 9 0000 0000"
                {...register("telefono")}
              />
              {errors.telefono ? (
                <p className="text-sm text-red-600">{errors.telefono.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="asunto" className="text-sm font-medium text-slate-700">
              Asunto
            </label>
            <Input
              id="asunto"
              placeholder="Tema de tu consulta"
              {...register("asunto")}
            />
            {errors.asunto ? (
              <p className="text-sm text-red-600">{errors.asunto.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="mensaje" className="text-sm font-medium text-slate-700">
              Mensaje
            </label>
            <Textarea
              id="mensaje"
              placeholder="Cuéntanos detalles de tu servicio..."
              {...register("mensaje")}
            />
            {errors.mensaje ? (
              <p className="text-sm text-red-600">{errors.mensaje.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              <SendHorizontal className="h-4 w-4" />
              {isSubmitting ? "Enviando..." : "Enviar mensaje"}
            </Button>

            <Link
              href="https://wa.me/56900000000"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <MessageCircleMore className="h-4 w-4 text-emerald-600" />
              WhatsApp
            </Link>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}