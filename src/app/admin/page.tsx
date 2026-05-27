import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, FileText, Users, ShieldCheck } from "lucide-react";
import type { RowDataPacket } from "mysql2";
import { getDbPool } from "@/lib/db";

type DenunciaReciente = {
  codigo: string;
  tipo: string;
  estado: string;
  prioridad: string;
  creado_en: Date;
};

type ActividadLog = {
  accion: string;
  entidad: string | null;
  entidad_id: number | null;
  creado_en: Date;
  usuario_nombre: string | null;
};

type DashboardStats = {
  total: number;
  en_revision: number;
  cerradas: number;
  criticas: number;
};

const tipoLabels: Record<string, string> = {
  infraccion_ley_20393: "Infracción a Ley 20.393",
  acoso_laboral: "Acoso Laboral",
  acoso_sexual: "Acoso Sexual",
  discriminacion: "Discriminación",
  robo_hurto_fraude: "Robo, Hurto o Fraude",
  conflicto_interes: "Conflicto de Interés",
  negligencia: "Negligencia",
  otro: "Otro Incumplimiento",
};

const estadoLabels: Record<string, string> = {
  nueva: "Nueva",
  en_revision: "En Revisión",
  cerrada: "Cerrada",
  archivada: "Archivada",
};

const accionLabels: Record<string, string> = {
  LOGIN: "Inicio de sesión",
  CAMBIO_ESTADO: "Cambio de estado",
  ASIGNAR_ANALISTA: "Analista asignado",
  CERRAR_DENUNCIA: "Denuncia cerrada",
  NUEVA_DENUNCIA: "Nueva denuncia ingresada",
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD} día${diffD > 1 ? "s" : ""}`;
}

async function getDashboardData() {
  const pool = getDbPool();

  const [[statsRow], [recentRows], [activityRows]] = await Promise.all([
    pool.execute<RowDataPacket[]>(`
      SELECT
        COUNT(*) AS total,
        SUM(estado = 'en_revision') AS en_revision,
        SUM(estado IN ('cerrada','archivada')) AS cerradas,
        SUM(prioridad = 'alta' AND estado NOT IN ('cerrada','archivada')) AS criticas
      FROM bm_denuncias
    `),
    pool.execute<RowDataPacket[]>(`
      SELECT codigo, tipo, estado, prioridad, creado_en
      FROM bm_denuncias
      ORDER BY creado_en DESC
      LIMIT 5
    `),
    pool.execute<RowDataPacket[]>(`
      SELECT l.accion, l.entidad, l.entidad_id, l.creado_en, u.nombre AS usuario_nombre
      FROM bm_logs_auditoria l
      LEFT JOIN bm_usuarios u ON u.id = l.usuario_id
      ORDER BY l.creado_en DESC
      LIMIT 5
    `),
  ]);

  const s = statsRow[0] ?? {};
  return {
    stats: {
      total: Number(s.total ?? 0),
      en_revision: Number(s.en_revision ?? 0),
      cerradas: Number(s.cerradas ?? 0),
      criticas: Number(s.criticas ?? 0),
    } as DashboardStats,
    recientes: recentRows as DenunciaReciente[],
    actividad: activityRows as ActividadLog[],
  };
}

export default async function AdminDashboardPage() {
  const { stats, recientes, actividad } = await getDashboardData();

  const kpis = [
    {
      title: "Denuncias Totales",
      value: stats.total,
      icon: FileText,
      lightColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "En Revisión",
      value: stats.en_revision,
      icon: Clock,
      lightColor: "bg-amber-100",
      textColor: "text-amber-600",
    },
    {
      title: "Cerradas / Archivadas",
      value: stats.cerradas,
      icon: CheckCircle2,
      lightColor: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      title: "Críticas / Urgentes",
      value: stats.criticas,
      icon: AlertTriangle,
      lightColor: "bg-red-100",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard de Ética</h1>
          <p className="text-slate-500 mt-1">Resumen general del estado de las denuncias corporativas.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Icon size={80} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.lightColor} ${kpi.textColor}`}>
                  <Icon size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-500">{kpi.title}</p>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mt-auto">{kpi.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Denuncias Recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Denuncias Recientes</h3>
          </div>

          {recientes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No hay denuncias registradas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Código</th>
                    <th className="px-6 py-4 font-semibold">Tipo</th>
                    <th className="px-6 py-4 font-semibold">Prioridad</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {recientes.map((item) => (
                    <tr key={item.codigo} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                      <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                        {item.codigo}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {tipoLabels[item.tipo] ?? item.tipo}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.prioridad === "alta" ? "bg-red-100 text-red-700" :
                          item.prioridad === "media" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {item.prioridad.charAt(0).toUpperCase() + item.prioridad.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.estado === "nueva" ? "border-red-200 bg-red-50 text-red-600" :
                          item.estado === "en_revision" ? "border-blue-200 bg-blue-50 text-blue-600" :
                          "border-emerald-200 bg-emerald-50 text-emerald-600"
                        }`}>
                          {estadoLabels[item.estado] ?? item.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
            <Link href="/admin/denuncias" className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
              Ver todas las denuncias →
            </Link>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-white/5">
              <ShieldCheck size={140} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">Acceso Rápido</h3>
              <p className="text-slate-400 text-sm mb-6">
                {stats.criticas > 0
                  ? `Hay ${stats.criticas} denuncia${stats.criticas > 1 ? "s" : ""} de alta prioridad sin resolver.`
                  : "No hay denuncias críticas pendientes."}
              </p>
              <div className="space-y-3">
                <Link
                  href="/admin/denuncias"
                  className="w-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle size={18} /> Ver denuncias
                  </span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/usuarios"
                  className="w-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users size={18} /> Gestionar Usuarios
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Actividad Reciente</h3>
            {actividad.length === 0 ? (
              <p className="text-slate-400 text-sm">Sin actividad registrada.</p>
            ) : (
              <ul className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-slate-200">
                {actividad.map((log, i) => (
                  <li key={i} className="relative pl-6">
                    <span className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-white" />
                    <p className="text-sm font-medium text-slate-800">
                      {accionLabels[log.accion] ?? log.accion}
                      {log.entidad_id ? (
                        <span className="font-bold text-red-600"> #{log.entidad_id}</span>
                      ) : null}
                      {log.usuario_nombre ? (
                        <span className="text-slate-500"> · {log.usuario_nombre}</span>
                      ) : null}
                    </p>
                    <span className="text-xs text-slate-400">{timeAgo(log.creado_en)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
