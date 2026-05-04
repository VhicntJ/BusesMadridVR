"use client";
import { useState } from "react";
import { Settings, Bell, Lock, Mail, Info, Save, CheckCircle2 } from "lucide-react";

type Toggle = { label: string; desc: string; value: boolean; set: (v: boolean) => void };

export default function ConfiguracionPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [urgentNotif, setUrgentNotif] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggles: Toggle[] = [
    {
      label: "Nuevas denuncias por email",
      desc: "Recibir un correo al ingresar cada nueva denuncia.",
      value: emailNotif,
      set: setEmailNotif,
    },
    {
      label: "Alertas de prioridad alta",
      desc: "Notificación inmediata para denuncias urgentes o críticas.",
      value: urgentNotif,
      set: setUrgentNotif,
    },
    {
      label: "Resumen diario",
      desc: "Email con el resumen de actividad del día anterior.",
      value: dailyDigest,
      set: setDailyDigest,
    },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="text-slate-500" size={22} />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configuración</h1>
        </div>
        <p className="text-slate-500">Administra las preferencias y parámetros del portal ético.</p>
      </div>

      {/* Notifications */}
      <Section
        icon={<Bell size={18} className="text-amber-500" />}
        iconBg="bg-amber-50"
        title="Notificaciones"
        subtitle="Configura cuándo y cómo recibir alertas del sistema."
      >
        <div className="space-y-1 divide-y divide-slate-100">
          {toggles.map(({ label, desc, value, set }) => (
            <div key={label} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => set(!value)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                  value ? "bg-red-500" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    value ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Email */}
      <Section
        icon={<Mail size={18} className="text-blue-500" />}
        iconBg="bg-blue-50"
        title="Correo Electrónico"
        subtitle="Dirección para notificaciones y copias de respaldo."
      >
        <div className="space-y-4">
          <Field label="Email de notificaciones">
            <input
              type="email"
              defaultValue="admin@busesmadrid.cl"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
          </Field>
          <Field label="Email de respaldo (CC)">
            <input
              type="email"
              placeholder="backup@busesmadrid.cl"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
          </Field>
        </div>
      </Section>

      {/* Security */}
      <Section
        icon={<Lock size={18} className="text-red-500" />}
        iconBg="bg-red-50"
        title="Seguridad"
        subtitle="Cambio de contraseña y configuración de acceso."
      >
        <div className="space-y-4">
          <Field label="Contraseña actual">
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
          </Field>
          <Field label="Nueva contraseña">
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
          </Field>
          <Field label="Confirmar nueva contraseña">
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
          </Field>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
            Actualizar contraseña
          </button>
        </div>
      </Section>

      {/* System Info */}
      <Section
        icon={<Info size={18} className="text-slate-500" />}
        iconBg="bg-slate-100"
        title="Información del Sistema"
        subtitle="Datos técnicos del portal ético."
      >
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ["Nombre del sistema", "Portal Ética Buses Madrid"],
            ["Versión", "v2.0.1"],
            ["Entorno", "Producción"],
            ["Base de datos", "MySQL 8.0 (cPanel)"],
            ["Último backup", "Hoy, 03:00 AM"],
            ["Denuncias en sistema", "124"],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-50 rounded-xl p-4">
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                {label}
              </dt>
              <dd className="text-sm font-bold text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saved ? "¡Cambios guardados!" : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}

function Section({
  icon,
  iconBg,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
        <div>
          <h2 className="font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
