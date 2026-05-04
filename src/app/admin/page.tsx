import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Search,
  Filter,
  ShieldCheck
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Denuncias Totales",
      value: "124",
      change: "+12.5%",
      isPositive: true,
      icon: FileText,
      color: "bg-blue-500",
      lightColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "En Revisión",
      value: "12",
      change: "-2.4%",
      isPositive: true,
      icon: Clock,
      color: "bg-amber-500",
      lightColor: "bg-amber-100",
      textColor: "text-amber-600",
    },
    {
      title: "Resueltas",
      value: "108",
      change: "+18.2%",
      isPositive: true,
      icon: CheckCircle2,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      title: "Críticas / Urgentes",
      value: "4",
      change: "+2",
      isPositive: false,
      icon: AlertTriangle,
      color: "bg-red-500",
      lightColor: "bg-red-100",
      textColor: "text-red-600",
    },
  ];

  const recentDenuncias = [
    { id: "BM-4912", type: "Infracción a Ley 20.393", date: "16 Abr 2026", status: "Nueva", priority: "Alta" },
    { id: "BM-4809", type: "Acosto Laboral", date: "15 Abr 2026", status: "En Revisión", priority: "Media" },
    { id: "BM-4790", type: "Robo, Hurto o Fraude", date: "12 Abr 2026", status: "En Revisión", priority: "Alta" },
    { id: "BM-4655", type: "Conflicto de Interés", date: "10 Abr 2026", status: "Cerrada", priority: "Baja" },
    { id: "BM-4621", type: "Otro Incumplimiento", date: "05 Abr 2026", status: "Cerrada", priority: "Media" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard de Ética</h1>
          <p className="text-slate-500 mt-1">Resumen general del estado de las denuncias corporativas.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium shadow-sm hover:bg-slate-50 flex items-center gap-2">
            <Filter size={16} /> <span>Filtrar</span>
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium shadow-md hover:bg-slate-800 transition-colors">
            Generar Reporte
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Icon size={80} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.lightColor} ${stat.textColor}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-auto">
                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Denuncias Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Denuncias Recientes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por código..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Código</th>
                  <th className="px-6 py-4 font-semibold">Tipo de Infracción</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Prioridad</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentDenuncias.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-red-600 transition-colors">{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{item.type}</td>
                    <td className="px-6 py-4 text-slate-500">{item.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.priority === 'Alta' ? 'bg-red-100 text-red-700' :
                        item.priority === 'Media' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        item.status === 'Nueva' ? 'border-red-200 bg-red-50 text-red-600' :
                        item.status === 'En Revisión' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                        'border-emerald-200 bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
            <Link
              href="/admin/denuncias"
              className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Ver todas las denuncias →
            </Link>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-white/5">
              <ShieldCheck size={140} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">Acceso Rápido</h3>
              <p className="text-slate-400 text-sm mb-6">Revisa las alertas de alta prioridad inmediatamente.</p>
              
              <div className="space-y-3">
                <Link
                  href="/admin/denuncias"
                  className="w-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle size={18} /> Iniciar Revisión BM-4912
                  </span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin/usuarios"
                  className="w-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users size={18} /> Asignar Analistas
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 line-clamp-4">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Actividad Reciente</h3>
             <ul className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-slate-200">
               <li className="relative pl-6">
                 <span className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-white" />
                 <p className="text-sm font-medium text-slate-800">Nueva denuncia <span className="font-bold text-red-600">BM-4912</span> ingresada.</p>
                 <span className="text-xs text-slate-400">Hace 15 minutos</span>
               </li>
               <li className="relative pl-6">
                 <span className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                 <p className="text-sm font-medium text-slate-800">Analista Carlos asignó <span className="font-bold">BM-4809</span> a revisión.</p>
                 <span className="text-xs text-slate-400">Hace 2 horas</span>
               </li>
               <li className="relative pl-6">
                 <span className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                 <p className="text-sm font-medium text-slate-800">Denuncia <span className="font-bold">BM-4655</span> cerrada exitosamente.</p>
                 <span className="text-xs text-slate-400">Ayer</span>
               </li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
