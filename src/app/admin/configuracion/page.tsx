"use client";
import { useEffect, useState } from "react";
import { Settings, Bell, Lock, Mail, Info, Save, CheckCircle2 } from "lucide-react";

const CONFIG_KEYS = [
  "email_notificaciones",
  "email_respaldo",
  "notif_nueva_denuncia",
  "notif_prioridad_alta",
  "notif_resumen_diario",
  "sitio_nombre",
  "sitio_version",
];

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/admin/configuracion", { cache: "no-store" });
        if (!response.ok) throw new Error("Error cargando configuración");
        const data = await response.json();
        const map: Record<string, string> = {};
        for (const item of data.items || []) {
          map[String(item.clave)] = String(item.valor ?? "");
        }
        setConfig(map);
      } catch (error) {
        console.error("Error fetching config:", error);
        setSaveError("No se pudo cargar la configuración.");
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  const isOn = (clave: string) => config[clave] === "1";

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      const items = CONFIG_KEYS.map((clave) => ({ clave, valor: config[clave] ?? "" }));
      const response = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSaveError(data.error || "Error al guardar la configuración");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdMessage("");

    if (newPassword.length < 8) {
      setPwdError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setPwdSaving(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPwdError(data.error || "Error al cambiar la contraseña");
        return;
      }
      setPwdMessage("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPwdError("Error de conexión. Intenta de nuevo.");
    } finally {
      setPwdSaving(false);
    }
  };

  const toggles = [
    {
      clave: "notif_nueva_denuncia",
      label: "Nuevas denuncias por email",
      desc: "Recibir un correo al ingresar cada nueva denuncia.",
    },
    {
      clave: "notif_prioridad_alta",
      label: "Alertas de prioridad alta",
      desc: "Notificación inmediata para denuncias urgentes o críticas.",
    },
    {
      clave: "notif_resumen_diario",
      label: "Resumen diario",
      desc: "Email con el resumen de actividad del día anterior.",
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

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
          Cargando configuración...
        </div>
      ) : (
        <>
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          )}

          {/* Notifications */}
          <Section
            icon={<Bell size={18} className="text-amber-500" />}
            iconBg="bg-amber-50"
            title="Notificaciones"
            subtitle="Configura cuándo y cómo recibir alertas del sistema."
          >
            <div className="space-y-1 divide-y divide-slate-100">
              {toggles.map(({ clave, label, desc }) => {
                const value = isOn(clave);
                return (
                  <div key={clave} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, [clave]: value ? "0" : "1" })}
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
                );
              })}
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
                  value={config["email_notificaciones"] ?? ""}
                  onChange={(e) => setConfig({ ...config, email_notificaciones: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              </Field>
              <Field label="Email de respaldo (CC)">
                <input
                  type="email"
                  value={config["email_respaldo"] ?? ""}
                  onChange={(e) => setConfig({ ...config, email_respaldo: e.target.value })}
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
            subtitle="Cambio de contraseña de tu cuenta."
          >
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Field label="Contraseña actual">
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              </Field>
              <Field label="Nueva contraseña">
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              </Field>
              <Field label="Confirmar nueva contraseña">
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              </Field>
              {pwdError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {pwdError}
                </div>
              )}
              {pwdMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {pwdMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={pwdSaving}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {pwdSaving ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>
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
                ["Nombre del sistema", config["sitio_nombre"] || "Portal Ética Buses Madrid"],
                ["Versión", config["sitio_version"] || "—"],
                ["Base de datos", "MySQL (cPanel)"],
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
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
                saved ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {saved ? "¡Cambios guardados!" : saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </>
      )}
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
