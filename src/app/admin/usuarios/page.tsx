"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Shield,
  Eye,
  Edit2,
  Plus,
  Search,
  UserCheck,
  X,
  PowerOff,
  Power,
} from "lucide-react";

type Role = "administrador" | "analista" | "observador";

type User = {
  id: number;
  nombre: string;
  email: string;
  rol: Role;
  estado: string;
  ultimo_acceso: string | null;
  creado_en: string;
};

const ROLE_CONFIG: Record<Role, { label: string; color: string; icon: typeof Shield }> = {
  administrador: { label: "Administrador", color: "bg-red-100 text-red-700 border-red-200", icon: Shield },
  analista: { label: "Analista", color: "bg-blue-100 text-blue-700 border-blue-200", icon: UserCheck },
  observador: { label: "Observador", color: "bg-slate-100 text-slate-600 border-slate-200", icon: Eye },
};

const ESTADOS = ["activo", "inactivo", "suspendido"] as const;

const PERMISSIONS: [string, boolean, boolean, boolean][] = [
  ["Ver denuncias", true, true, true],
  ["Gestionar denuncias", true, true, false],
  ["Cerrar denuncias", true, true, false],
  ["Asignar analistas", true, false, false],
  ["Gestionar usuarios", true, false, false],
  ["Ver reportes", true, true, false],
  ["Configuración del sistema", true, false, false],
];

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

type FormState = {
  nombre: string;
  email: string;
  password: string;
  rol: Role;
  estado: string;
};

const EMPTY_FORM: FormState = {
  nombre: "",
  email: "",
  password: "",
  rol: "observador",
  estado: "activo",
};

export default function UsuariosPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | { mode: "create" | "edit"; user?: User }>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/usuarios", { cache: "no-store" });
      if (!response.ok) throw new Error("Error cargando usuarios");
      const data = await response.json();
      setUsers(data.items || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.nombre.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  const counts = useMemo(
    () => ({
      administrador: users.filter((u) => u.rol === "administrador").length,
      analista: users.filter((u) => u.rol === "analista").length,
      observador: users.filter((u) => u.rol === "observador").length,
    }),
    [users]
  );

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError("");
    setModal({ mode: "create" });
  }

  function openEdit(user: User) {
    setForm({
      nombre: user.nombre,
      email: user.email,
      password: "",
      rol: user.rol,
      estado: user.estado,
    });
    setFormError("");
    setModal({ mode: "edit", user });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setFormError("");
    setSaving(true);

    try {
      const isCreate = modal.mode === "create";
      const url = isCreate ? "/api/admin/usuarios" : `/api/admin/usuarios/${modal.user?.id}`;

      const payload: Record<string, string> = {
        nombre: form.nombre,
        rol: form.rol,
        estado: form.estado,
      };
      if (isCreate) {
        payload.email = form.email;
        payload.password = form.password;
      } else if (form.password) {
        payload.password = form.password;
      }

      const response = await fetch(url, {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFormError(data.error || "Error al guardar el usuario");
        return;
      }

      setModal(null);
      await loadUsers();
    } catch {
      setFormError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEstado(user: User) {
    const nuevoEstado = user.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";
    if (!window.confirm(`¿Seguro que quieres ${accion} a ${user.nombre}?`)) return;

    setActionError("");
    try {
      const response = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setActionError(data.error || "Error al actualizar el usuario");
        return;
      }
      await loadUsers();
    } catch {
      setActionError("Error de conexión. Intenta de nuevo.");
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="text-amber-500" size={22} />
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Usuarios y Roles</h1>
          </div>
          <p className="text-slate-500">Administra el acceso y los permisos del portal ético.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-semibold shadow-md hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus size={15} /> Nuevo Usuario
        </button>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.keys(ROLE_CONFIG) as Role[]).map((role) => {
          const conf = ROLE_CONFIG[role];
          const Icon = conf.icon;
          return (
            <div
              key={role}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4"
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center border ${conf.color}`}
              >
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{counts[role]}</p>
                <p className="text-sm text-slate-500 font-medium">{conf.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Usuarios del Sistema</h3>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuario..."
              className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 w-52"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/70 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Usuario</th>
              <th className="px-6 py-4 font-semibold">Rol</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold">Último acceso</th>
              <th className="px-6 py-4 font-semibold">Miembro desde</th>
              <th className="px-6 py-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  Cargando usuarios...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No hay usuarios que coincidan.
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const conf = ROLE_CONFIG[user.rol] ?? ROLE_CONFIG.observador;
                const activo = user.estado === "activo";
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                          {user.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">{user.nombre}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.color}`}
                      >
                        {conf.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${activo ? "bg-emerald-500" : "bg-slate-400"}`}
                        />
                        {user.estado.charAt(0).toUpperCase() + user.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(user.ultimo_acceso)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(user.creado_en)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          title="Editar usuario"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => toggleEstado(user)}
                          title={activo ? "Desactivar usuario" : "Activar usuario"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            activo
                              ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {activo ? <PowerOff size={15} /> : <Power size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Matriz de Permisos por Rol</h3>
          <p className="text-sm text-slate-500 mt-0.5">Acciones habilitadas según el rol asignado.</p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-4 font-semibold pr-8">Permiso</th>
                <th className="pb-4 font-semibold text-center px-6">Administrador</th>
                <th className="pb-4 font-semibold text-center px-6">Analista</th>
                <th className="pb-4 font-semibold text-center px-6">Observador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSIONS.map(([label, admin, analista, observador]) => (
                <tr key={label}>
                  <td className="py-3.5 font-medium text-slate-700 pr-8">{label}</td>
                  {[admin, analista, observador].map((has, i) => (
                    <td key={i} className="py-3.5 text-center px-6">
                      {has ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold text-xs">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-300 text-lg leading-none">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {modal.mode === "create" ? "Nuevo Usuario" : `Editar: ${modal.user?.nombre}`}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: María González"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                  />
                </div>
                {modal.mode === "create" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="usuario@busesmadrid.cl"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rol</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value as Role })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
                  >
                    <option value="observador">Observador</option>
                    <option value="analista">Analista</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                {modal.mode === "edit" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado</label>
                    <select
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
                    >
                      {ESTADOS.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {modal.mode === "create" ? "Contraseña temporal" : "Nueva contraseña (opcional)"}
                  </label>
                  <input
                    type="password"
                    required={modal.mode === "create"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={modal.mode === "create" ? "Mínimo 8 caracteres" : "Dejar en blanco para no cambiar"}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                  />
                </div>
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Guardando..." : modal.mode === "create" ? "Crear Usuario" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
