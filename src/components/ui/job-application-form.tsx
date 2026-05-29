"use client";

import { useState, type ChangeEvent } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { CheckCircle2, Paperclip, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  regionesChile,
  comunasPorRegion,
  cargosDisponibles,
  experienciaOpciones,
  licenciaOpciones,
  disponibilidadOpciones,
} from "@/lib/job-data";

const rutMaxLength = 12;
const phoneMaxLength = 17;

const normalizeRut = (value: string) => value.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();

const formatRut = (value: string) => {
  const cleanValue = normalizeRut(value).replace(/[^0-9K]/g, "").slice(0, 9);

  if (!cleanValue) {
    return "";
  }

  if (cleanValue.length === 1) {
    return cleanValue;
  }

  const body = cleanValue.slice(0, -1);
  const verifier = cleanValue.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedBody}-${verifier}`;
};

const validateRut = (value: string) => {
  const cleanValue = normalizeRut(value).replace(/[^0-9K]/g, "");

  if (!/^\d{7,8}[0-9K]$/.test(cleanValue)) {
    return false;
  }

  const body = cleanValue.slice(0, -1);
  const verifier = cleanValue.slice(-1);
  let sum = 0;
  let multiplier = 2;

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expectedVerifier = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);

  return expectedVerifier === verifier;
};

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("56") && digits.length > 2) {
    return digits.slice(2);
  }

  return digits;
};

const formatPhone = (value: string) => {
  const digits = normalizePhone(value);

  if (!digits) {
    return "";
  }

  // Limitar a 9 dígitos
  const cleanDigits = digits.slice(0, 9);

  const firstGroup = cleanDigits.slice(0, 1);
  const middleGroup = cleanDigits.slice(1, 5);
  const lastGroup = cleanDigits.slice(5, 9);

  let formatted = `+56 ${firstGroup}`;

  if (middleGroup) {
    formatted += ` ${middleGroup}`;
  }

  if (lastGroup) {
    formatted += ` ${lastGroup}`;
  }

  return formatted;
};

const validatePhone = (value: string) => /^9\d{8}$/.test(normalizePhone(value));

const schema = z.object({
  nombres: z.string().min(2, "El nombre es requerido"),
  apellidos: z.string().min(2, "El apellido es requerido"),
  rut: z
    .string()
    .min(1, "Ingrese un RUT válido")
    .refine((value) => validateRut(value), "Ingrese un RUT válido"),
  correo: z.string().email("Ingrese un correo válido"),
  telefono: z
    .string()
    .min(1, "Ingrese un teléfono válido")
    .refine((value) => validatePhone(value), "Ingrese un teléfono válido"),
  region: z.string().min(1, "Seleccione una región"),
  comuna: z.string().min(1, "Seleccione una comuna"),
  licencia: z.string().min(1, "Seleccione tipo de licencia"),
  cargo: z.string().min(1, "Seleccione un cargo"),
  experiencia: z.string().min(1, "Seleccione años de experiencia"),
  trabajado_antes: z.string().min(1, "Responda si ha trabajado en Buses Madrid"),
  disponibilidad: z.string().min(1, "Seleccione disponibilidad de trabajo"),
  experiencia_detalle: z
    .string()
    .min(20, "Describa brevemente su experiencia (mínimo 20 caracteres)"),
  curriculum: z
    .any()
    .refine((file) => file?.length > 0, "El currículum es obligatorio")
    .refine(
      (file) =>
        file?.[0]?.type === "application/pdf" ||
        file?.[0]?.type === "application/msword" ||
        file?.[0]?.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Solo se aceptan archivos PDF o Word"
    )
    .refine((file) => file?.[0]?.size <= 5242880, "El archivo no debe superar 5MB"),
});

type FormData = z.infer<typeof schema>;

type JobApplicationFormProps = {
  onCancel?: () => void;
};

export function JobApplicationForm({ onCancel }: JobApplicationFormProps) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [toast, setToast] = useState<{ variant: "success" | "error"; message: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rut: "",
      telefono: "",
      region: "",
      comuna: "",
      licencia: "",
      cargo: "conductor",
      experiencia: "",
      trabajado_antes: "",
      disponibilidad: "",
    },
  });

  const region = watch("region");

  const onSubmit = async (data: FormData) => {
    setToast(null);

    try {
      // Obtener token de reCAPTCHA
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA no está disponible");
      }

      const recaptchaToken = await executeRecaptcha("job_application");

      // Crear FormData para enviar archivo
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "curriculum" && value && value[0]) {
          formData.append(key, value[0]);
        } else if (key !== "curriculum") {
          formData.append(key, String(value));
        }
      });
      formData.append("recaptchaToken", recaptchaToken);

      // Enviar a la API (multipart/form-data)
      const response = await fetch("/api/send-job-application", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar la postulación");
      }

      setSuccess(true);
      setToast({ variant: "success", message: "Postulación enviada correctamente." });
      console.log("✅ Postulación enviada exitosamente");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setToast({ variant: "error", message: errorMessage });
      console.error("❌ Error:", errorMessage);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? null);
  };

  const handleRutChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue("rut", formatRut(event.target.value), { shouldDirty: true, shouldValidate: true });
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(event.target.value);
    setValue("telefono", formatted, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const resetForm = () => {
    setSuccess(false);
    setFileName(null);
    setToast(null);
    reset();
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        {toast ? (
          <Toast
            variant={toast.variant}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : null}
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">¡Postulación Enviada!</h3>
        <p className="max-w-md text-slate-600">
          Gracias por tu interés en formar parte de nuestro equipo. Nos comunicaremos contigo en
          los próximos días a través de los datos proporcionados.
        </p>
        <div className="mt-4 flex w-full max-w-sm gap-3">
          <button
            onClick={resetForm}
            className="flex-1 rounded-lg border border-slate-300 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Enviar otra postulación
          </button>
          {onCancel ? (
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg bg-primary py-2 font-semibold text-white hover:bg-primary/90"
            >
              Cerrar
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-6">
      {toast ? (
        <Toast
          variant={toast.variant}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}

      <div className="mb-6 rounded-lg bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          Gracias por tu interés en formar parte de nuestro equipo. Te invitamos a completar el
          siguiente formulario con tus antecedentes de manera clara y actualizada. En caso de que
          se abra una vacante acorde a tu perfil y experiencia, nos pondremos en contacto contigo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-900">Nombres</label>
          <input
            {...register("nombres")}
            type="text"
            placeholder="Ingrese sus nombres"
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
              errors.nombres
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
            )}
          />
          {errors.nombres && <span className="mt-1 text-xs text-red-600">{errors.nombres.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">Apellidos</label>
          <input
            {...register("apellidos")}
            type="text"
            placeholder="Ingrese sus apellidos"
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
              errors.apellidos
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
            )}
          />
          {errors.apellidos && <span className="mt-1 text-xs text-red-600">{errors.apellidos.message}</span>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-semibold text-slate-900">RUT</label>
          <input
            {...register("rut", {
              onChange: handleRutChange,
            })}
            type="text"
            placeholder="12.345.678-9"
            maxLength={rutMaxLength}
            inputMode="text"
            autoComplete="off"
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
              errors.rut
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
            )}
          />
          {errors.rut && <span className="mt-1 text-xs text-red-600">{errors.rut.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">Correo Electrónico</label>
          <input
            {...register("correo")}
            type="email"
            placeholder="tu@email.com"
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
              errors.correo
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
            )}
          />
          {errors.correo && <span className="mt-1 text-xs text-red-600">{errors.correo.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">Teléfono</label>
          <input
            {...register("telefono", {
              onChange: handlePhoneChange,
            })}
            type="tel"
            placeholder="+56 9 1234 5678"
            maxLength={phoneMaxLength}
            inputMode="tel"
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
              errors.telefono
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
            )}
          />
          {errors.telefono && <span className="mt-1 text-xs text-red-600">{errors.telefono.message}</span>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-900">Región de Residencia</label>
          <select
            {...register("region", {
              onChange: () => {
                setValue("comuna", "");
              },
            })}
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
              errors.region
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
            )}
          >
            <option value="">Seleccione una región</option>
            {regionesChile.map((regionItem) => (
              <option key={regionItem} value={regionItem}>
                {regionItem}
              </option>
            ))}
          </select>
          {errors.region && <span className="mt-1 text-xs text-red-600">{errors.region.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">Comuna de Residencia</label>
          <select
            {...register("comuna")}
            disabled={!region}
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
              !region && "bg-slate-100 opacity-50",
              errors.comuna
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
            )}
          >
            <option value="">Seleccione una comuna</option>
            {region &&
              comunasPorRegion[region]?.map((comuna) => (
                <option key={comuna} value={comuna}>
                  {comuna}
                </option>
              ))}
          </select>
          {errors.comuna && <span className="mt-1 text-xs text-red-600">{errors.comuna.message}</span>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-900">Tipo de Licencia</label>
          <select
            {...register("licencia")}
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
              errors.licencia
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
            )}
          >
            <option value="">Seleccione licencia</option>
            {licenciaOpciones.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.licencia && <span className="mt-1 text-xs text-red-600">{errors.licencia.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">Años de Experiencia</label>
          <select
            {...register("experiencia")}
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
              errors.experiencia
                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
            )}
          >
            <option value="">Seleccione experiencia</option>
            {experienciaOpciones.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.experiencia && <span className="mt-1 text-xs text-red-600">{errors.experiencia.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900">Área / Cargo al que Postula</label>
        <select
          {...register("cargo")}
          className={cn(
            "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
            errors.cargo
              ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
              : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
          )}
        >
          <option value="">Seleccione un cargo</option>
          {cargosDisponibles.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.cargo && <span className="mt-1 text-xs text-red-600">{errors.cargo.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900">¿Ha trabajado antes en Buses Madrid?</label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" value="si" {...register("trabajado_antes")} />
            <span className="text-sm text-slate-700">Sí</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="no" {...register("trabajado_antes")} />
            <span className="text-sm text-slate-700">No</span>
          </label>
        </div>
        {errors.trabajado_antes && (
          <span className="mt-1 text-xs text-red-600">{errors.trabajado_antes.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900">Disponibilidad para Trabajar</label>
        <select
          {...register("disponibilidad")}
          className={cn(
            "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
            errors.disponibilidad
              ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
              : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
          )}
        >
          <option value="">Seleccione disponibilidad</option>
          {disponibilidadOpciones.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.disponibilidad && (
          <span className="mt-1 text-xs text-red-600">{errors.disponibilidad.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900">Descripción de Experiencia</label>
        <textarea
          {...register("experiencia_detalle")}
          placeholder="Describe brevemente tu experiencia, lugares y servicios relevantes..."
          rows={4}
          className={cn(
            "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
            errors.experiencia_detalle
              ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
              : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
          )}
        />
        {errors.experiencia_detalle && (
          <span className="mt-1 text-xs text-red-600">{errors.experiencia_detalle.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900">Adjuntar Currículum (Obligatorio)</label>
        <div className="mt-2">
          <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-4 transition-colors hover:border-primary hover:bg-primary/5">
            <Paperclip className="h-5 w-5 text-slate-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">{fileName ? fileName : "Seleccionar archivo"}</p>
              <p className="text-xs text-slate-500">PDF o Word - Máximo 5MB</p>
            </div>
            <input
              {...register("curriculum", { onChange: handleFileChange })}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
          </label>
        </div>
        {errors.curriculum && (
          <span className="mt-1 text-xs text-red-600">
            {"message" in (errors.curriculum || {})
              ? (errors.curriculum as { message?: string }).message
              : "El currículum es obligatorio"}
          </span>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg bg-primary py-2 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50",
            onCancel ? "flex-1" : "w-full"
          )}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Enviando..." : "Enviar Postulación"}
        </button>
      </div>
    </form>
  );
}
