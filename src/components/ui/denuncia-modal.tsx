"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertTriangle, Paperclip, Search, Clock } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    tipoDenuncia: z.string().min(1, "Seleccione un tipo de denuncia"),
    tipoEnvio: z.enum(["anonimo", "con_datos"]),
    nombre: z.string().optional(),
    rut: z.string().optional(),
    celular: z.string().optional(),
    correo: z.string().optional(),
    lugar: z.string().min(5, "El lugar de la infracción es requerido"),
    detalle: z
      .string()
      .min(20, "Por favor, ingrese la mayor cantidad posible de detalles"),
    archivo: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoEnvio === "con_datos") {
      if (!data.nombre || data.nombre.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre es requerido",
          path: ["nombre"],
        });
      }
      if (!data.rut || data.rut.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El RUT es requerido",
          path: ["rut"],
        });
      }
      if (!data.celular || data.celular.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El celular es requerido",
          path: ["celular"],
        });
      }
      if (!data.correo || !/^\S+@\S+\.\S+$/.test(data.correo)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese un correo electrónico válido",
          path: ["correo"],
        });
      }
    }
  });

type FormData = z.infer<typeof schema>;

type DenunciaModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DenunciaModal({ isOpen, onClose }: DenunciaModalProps) {
  const [viewMode, setViewMode] = useState<"form" | "tracking">("form");
  const [success, setSuccess] = useState(false);
  const [trackingData, setTrackingData] = useState({ code: "", password: "" });
  const [fileName, setFileName] = useState<string | null>(null);

  // Tracking states
  const [searchCode, setSearchCode] = useState("");
  const [searchPassword, setSearchPassword] = useState("");
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipoEnvio: "anonimo",
      tipoDenuncia: "",
    },
  });

  const tipoEnvio = watch("tipoEnvio");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (_data: FormData) => {
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const generatedCode = "BM-" + Math.floor(1000 + Math.random() * 9000);
    const generatedPassword = Math.random().toString(36).slice(-6).toUpperCase();

    setTrackingData({ code: generatedCode, password: generatedPassword });
    setSuccess(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode || !searchPassword) return;
    
    setIsSearching(true);
    // Simulate API search
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSearching(false);
    setTrackingStatus("Su denuncia se encuentra actualmente en fase de revisión preliminar por nuestro comité de ética.");
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      reset();
      setFileName(null);
      setViewMode("form");
      setTrackingStatus(null);
      setSearchCode("");
      setSearchPassword("");
    }, 500); // Wait for the exit animation
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-slate-800">
                      Canal de Denuncia
                    </h3>
                  </div>
                  
                  {viewMode === "form" ? (
                    <button
                      onClick={() => setViewMode("tracking")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-300"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Ver estado de denuncia
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setViewMode("form");
                        setTrackingStatus(null);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200"
                    >
                      Volver a Nueva Denuncia
                    </button>
                  )}
                </div>
                
                <button
                  onClick={handleClose}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 ml-auto"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {viewMode === "tracking" ? (
                  // Tracking View
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">
                        Consultar Estado de Denuncia
                      </h4>
                      <p className="mt-2 text-sm text-slate-600">
                        Ingrese el código de seguimiento y la contraseña que se le
                        proporcionó al momento de realizar su denuncia para conocer el
                        estado actual de la investigación.
                      </p>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Código de seguimiento
                        </label>
                        <input
                          value={searchCode}
                          onChange={(e) => setSearchCode(e.target.value)}
                          placeholder="Ej: BM-1234"
                          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Contraseña temporal
                        </label>
                        <input
                          value={searchPassword}
                          onChange={(e) => setSearchPassword(e.target.value)}
                          placeholder="Ingrese su contraseña"
                          type="password"
                          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSearching || !searchCode || !searchPassword}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-slate-800 disabled:opacity-70 mt-2"
                      >
                        {isSearching ? "Buscando..." : "Consultar Estado"}
                      </button>
                    </form>

                    {trackingStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5"
                      >
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <Clock className="h-5 w-5" />
                          <h5 className="font-bold">Estado Actual: En Revisión</h5>
                        </div>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          {trackingStatus}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : success ? (
                  // Success View
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center space-y-6 py-10 text-center"
                  >
                    <div className="rounded-full bg-green-100 p-4 text-green-600">
                      <Send className="h-10 w-10" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">
                        Denuncia Ingresada Exitosamente
                      </h4>
                      <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                        Al realizar su denuncia se ha generado un código y una contraseña
                        para poder ir viendo el estado de este proceso.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full max-w-sm space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Código de seguimiento
                        </p>
                        <p className="text-2xl font-bold text-slate-800 tracking-widest mt-1">
                          {trackingData.code}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Contraseña Temporal
                        </p>
                        <p className="text-xl font-bold text-slate-800 tracking-widest mt-1">
                          {trackingData.password}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-4 px-8">
                      Por favor, guarde estos datos en un lugar seguro. Son la única
                      forma de acceder al seguimiento de su denuncia.
                    </p>
                    
                    <button
                      onClick={handleClose}
                      className="mt-4 rounded-xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                    >
                      Aceptar y Cerrar
                    </button>
                  </motion.div>
                ) : (
                  // Form View
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-[13px] leading-relaxed text-slate-600 text-justify">
                          Con el objetivo de mantener y proteger los más altos estándares de ética en las relaciones humanas y en los negocios, así como fomentar la integridad en todo tipo de transacciones e interacciones, <strong>Buses Madrid</strong> ha desarrollado un canal de denuncias, simple y seguro, que garantiza el anonimato y la confidencialidad a todas aquellas personas, ya sean internas, externas y/o proveedores de la compañía, que conozcan o sospechen de alguna actividad desarrollada por algún trabajador de la empresa, que pudiese implicar una violación a la LEY N° 20.393 dejando expresamente de manifiesto que la compañía prohíbe cualquier tipo de represalia ante las denuncias realizadas de buena fe.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-900 uppercase">
                          (*) SELECCIONE TIPO DENUNCIA
                        </label>
                        <select
                          {...register("tipoDenuncia")}
                          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                        >
                          <option value="">Seleccione Tipo de Denuncia...</option>
                          <option value="Infraccion a Ley 20.393">Infracción a Ley 20.393 (Cohecho, lavado de activos, etc.)</option>
                          <option value="Acoso Laboral">Acoso Laboral</option>
                          <option value="Acoso Sexual">Acoso Sexual</option>
                          <option value="Robo o Hurto">Robo, Hurto o Fraude</option>
                          <option value="Conflicto de Interes">Conflicto de Interés</option>
                          <option value="Otro">Otro Incumplimiento Ético</option>
                        </select>
                        {errors.tipoDenuncia && (
                          <p className="text-xs text-red-500">{errors.tipoDenuncia.message}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-900 uppercase">
                          (*) ¿CÓMO DESEA REALIZAR SU DENUNCIA?
                        </label>
                        <Controller
                          name="tipoEnvio"
                          control={control}
                          render={({ field }) => (
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => field.onChange("anonimo")}
                                className={cn(
                                  "flex items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all",
                                  field.value === "anonimo"
                                    ? "border-red-600 bg-red-50 text-red-700"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                )}
                              >
                                Anónimo
                              </button>
                              <button
                                type="button"
                                onClick={() => field.onChange("con_datos")}
                                className={cn(
                                  "flex items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all",
                                  field.value === "con_datos"
                                    ? "border-red-600 bg-red-50 text-red-700"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                )}
                              >
                                Con mis datos
                              </button>
                            </div>
                          )}
                        />
                      </div>

                      {/* Conditional Personal Details */}
                      <AnimatePresence>
                        {tipoEnvio === "con_datos" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Nombre Completo</label>
                                <input
                                  {...register("nombre")}
                                  placeholder="Ej: Juan Pérez"
                                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                                {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">RUT</label>
                                <input
                                  {...register("rut")}
                                  placeholder="Ej: 11.111.111-1"
                                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                                {errors.rut && <p className="text-xs text-red-500">{errors.rut.message}</p>}
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Número de Celular</label>
                                <input
                                  {...register("celular")}
                                  placeholder="Ej: +56912345678"
                                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                                {errors.celular && <p className="text-xs text-red-500">{errors.celular.message}</p>}
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Correo Electrónico</label>
                                <input
                                  {...register("correo")}
                                  placeholder="Ej: ejemplo@micorreo.cl"
                                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                                {errors.correo && <p className="text-xs text-red-500">{errors.correo.message}</p>}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-900 uppercase">
                          (*) ¿EN QUé LUGAR SE PRESENtó LA INFRACCIÓN?
                        </label>
                        <input
                          {...register("lugar")}
                          placeholder="Ej: Base operaciones, Oficina Central, Ruta específica..."
                          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        {errors.lugar && (
                          <p className="text-xs text-red-500">{errors.lugar.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-900 uppercase">
                          (*) INGRESE LA MAYOR CANTIDAD POSIBLE DE DETALLES
                        </label>
                        <textarea
                          {...register("detalle")}
                          rows={5}
                          className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          placeholder="Describa los hechos, fechas aproximadas, personas involucradas y cualquier otra información relevante (* Datos necesarios para la denuncia)..."
                        />
                        {errors.detalle && (
                          <p className="text-xs text-red-500">{errors.detalle.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-900 uppercase">
                          Cargar Archivo (Opcional)
                        </label>
                        <p className="text-xs text-slate-500 pb-2">
                          Para subir archivos adjuntos a su denuncia, presione el botón cargar archivos.
                        </p>
                        
                        <label
                          htmlFor="file-upload"
                          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm transition-colors hover:border-slate-400 hover:bg-slate-100"
                        >
                          <Paperclip className="h-5 w-5 text-slate-400" />
                          <span className="font-medium text-slate-600">
                            {fileName ? fileName : "Haga clic para cargar archivos probatorios"}
                          </span>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setFileName(e.target.files[0].name);
                                setValue("archivo", e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-300 hover:bg-red-700 hover:-translate-y-1 hover:shadow-red-600/30 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                          {isSubmitting ? (
                            "Procesando Denuncia..."
                          ) : (
                            <>
                              <Send className="h-5 w-5" /> Enviar Denuncia de forma Segura
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
