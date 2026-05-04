"use client";
import { useState } from "react";
import { Users, Shield, Eye, Edit2, Trash2, Plus, Search, UserCheck, X } from "lucide-react";

type Role = "Administrador" | "Analista" | "Observador";
type Status = "Activo" | "Inactivo";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLogin: string;
  createdAt: string;
};

const mockUsers: User[] = [
  {
    id: 1,
    name: "Admin Principal",
    email: "admin@busesmadrid.cl",
    role: "Administrador",
    status: "Activo",
    lastLogin: "Hoy, 09:15",
    createdAt: "01 Ene 2025",
  },
  {
    id: 2,
    name: "Carlos Morales",
    email: "c.morales@busesmadrid.cl",
    role: "Analista",
    status: "Activo",
    lastLogin: "Ayer, 14:30",
    createdAt: "15 Mar 2025",
  },
  {
    id: 3,
    name: "Ana Pérez",
    email: "a.perez@busesmadrid.cl",
    role: "Analista",
    status: "Activo",
    lastLogin: "Hace 2 días",
    createdAt: "20 Mar 2025",
  },
  {
    id: 4,
    name: "Jorge Silva",
    email: "j.silva@busesmadrid.cl",
    role: "Observador",
    status: "Inactivo",
    lastLogin: "Hace 15 días",
    createdAt: "01 Abr 2025",
  },
];

const ROLE_CONFIG: Record<Role, { color: string; icon: typeof Shield }> = {
  Administrador: { color: "bg-red-100 text-red-700 border-red-200", icon: Shield },
  Analista: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: UserCheck },
  Observador: { color: "bg-slate-100 text-slate-600 border-slate-200", icon: Eye },
};

const PERMISSIONS: [string, boolean, boolean, boolean][] = [
  ["Ver denuncias", true, true, true],
  ["Gestionar denuncias", true, true, false],
  ["Cerrar denuncias", true, true, false],
  ["Asignar analistas", true, false, false],
  ["Gestionar usuarios", true, false, false],
  ["Ver reportes", true, true, false],
  ["Configuración del sistema", true, false, false],
];

export default function UsuariosPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

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
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-semibold shadow-md hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus size={15} /> Nuevo Usuario
        </button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["Administrador", "Analista", "Observador"] as Role[]).map((role) => {
          const conf = ROLE_CONFIG[role];
          const Icon = conf.icon;
          const count = mockUsers.filter((u) => u.role === role).length;
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
                <p className="text-2xl font-bold text-slate-800">{count}</p>
                <p className="text-sm text-slate-500 font-medium">{role}</p>
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
            {filtered.map((user) => {
              const conf = ROLE_CONFIG[user.role];
              return (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.color}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.status === "Activo"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "Activo" ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 text-slate-500">{user.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                      {user.id !== 1 && (
                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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

      {/* New User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Nuevo Usuario</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: María González"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="usuario@busesmadrid.cl"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rol</label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white">
                  <option value="observador">Observador</option>
                  <option value="analista">Analista</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contraseña temporal
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
