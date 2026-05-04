"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, AlertCircle, Settings, LogOut, Users, ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    href: "/admin/denuncias",
    label: "Buzón Denuncias",
    icon: AlertCircle,
    badge: "3",
    badgeColor: "bg-red-500",
  },
  { href: "/admin/usuarios", label: "Usuarios y Roles", icon: Users },
];

const systemItems = [
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg">
            <ShieldCheck className="text-white h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide leading-tight">Buses Madrid</h2>
            <p className="text-xs text-slate-400 font-medium">Portal Ética</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Gestión
          </p>

          {navItems.map(({ href, label, icon: Icon, badge, badgeColor, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${
                  active
                    ? "bg-red-600/10 text-red-400 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-red-400"
                      : "text-slate-400 group-hover:text-white transition-colors"
                  }
                />
                <span>{label}</span>
                {badge && (
                  <span
                    className={`ml-auto ${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sistema
            </p>
          </div>

          {systemItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${
                  active
                    ? "bg-red-600/10 text-red-400 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-red-400"
                      : "text-slate-400 group-hover:text-white transition-colors"
                  }
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <div className="bg-slate-800/50 rounded-xl p-4 mb-2 flex items-center gap-3">
            <div className="bg-slate-700 h-10 w-10 rounded-full flex items-center justify-center font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm font-bold text-white">Admin</p>
              <p className="text-xs text-slate-400">admin@busesmadrid.cl</p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl font-medium transition-colors">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen pb-12">{children}</main>
    </div>
  );
}
