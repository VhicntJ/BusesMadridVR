"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircleMore, SendHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

const contactSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Ingresa un email valido"),
  telefono: z.string().min(8, "Ingresa un telefono valido"),
  mensaje: z.string().min(10, "Escribe un mensaje mas detallado"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    setIsSent(true);
    reset();
  };

  return (
    <Card className="bg-white/85">
      <CardHeader>
        <CardTitle>Solicita una cotizacion</CardTitle>
        <CardDescription>
          Te responderemos a la brevedad con una propuesta personalizada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@empresa.cl"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label htmlFor="telefono" className="text-sm font-medium text-slate-700">
                Telefono
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
            <label htmlFor="mensaje" className="text-sm font-medium text-slate-700">
              Mensaje
            </label>
            <Textarea
              id="mensaje"
              placeholder="Cuantanos detalles de tu servicio..."
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

          {isSent ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Mensaje enviado correctamente. Te contactaremos pronto.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}