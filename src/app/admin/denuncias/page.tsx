"use client";
import { useState, useMemo } from "react";
import {
  AlertCircle,
  Search,
  Eye,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Status = "Nueva" | "En Revisión" | "Cerrada" | "Archivada";
type Priority = "Alta" | "Media" | "Baja";

type Denuncia = {
  id: string;
  type: string;
  submitter: "Anónimo" | "Identificado";
  date: string;
  status: Status;
  priority: Priority;
  analyst?: string;
};

const mockDenuncias: Denuncia[] = [
  { id: "BM-4912", type: "Infracción a Ley 20.393", submitter: "Anónimo", date: "16 Abr 2026", status: "Nueva", priority: "Alta" },
  { id: "BM-4809", type: "Acoso Laboral", submitter: "Identificado", date: "15 Abr 2026", status: "En Revisión", priority: "Media", analyst: "Carlos M." },
  { id: "BM-4790", type: "Robo, Hurto o Fraude", submitter: "Anónimo", date: "12 Abr 2026", status: "En Revisión", priority: "Alta", analyst: "Ana P." },
  { id: "BM-4655", type: "Conflicto de Interés", submitter: "Identificado", date: "10 Abr 2026", status: "Cerrada", priority: "Baja", analyst: "Carlos M." },
  { id: "BM-4621", type: "Otro Incumplimiento", submitter: "Anónimo", date: "05 Abr 2026", status: "Cerrada", priority: "Media" },
  { id: "BM-4588", type: "Discriminación o Trato Injusto", submitter: "Identificado", date: "03 Abr 2026", status: "En Revisión", priority: "Alta", analyst: "Ana P." },
  { id: "BM-4540", type: "Acoso Sexual", submitter: "Anónimo", date: "29 Mar 2026", status: "Nueva", priority: "Alta" },
  { id: "BM-4501", type: "Negligencia o Desidia", submitter: "Identificado", date: "25 Mar 2026", status: "Cerrada", priority: "Baja", analyst: "Carlos M." },
  { id: "BM-4480", type: "Infracción a Ley 20.393", submitter: "Anónimo", date: "20 Mar 2026", status: "Archivada", priority: "Media" },
  { id: "BM-4401", type: "Robo, Hurto o Fraude", submitter: "Identificado", date: "15 Mar 2026", status: "Cerrada", priority: "Alta", analyst: "Ana P." },
  { id: "BM-4380", type: "Conflicto de Interés", submitter: "Anónimo", date: "10 Mar 2026", status: "Cerrada", priority: "Media" },
  { id: "BM-4350", type: "Otro Incumplimiento", submitter: "Anónimo", date: "05 Mar 2026", status: "Archivada", priority: "Baja" },
];

const STATUS_CONFIG: Record<Status, { row: string; badge: string; dot: string }> = {
  Nueva: {
    row: "border-red-200 bg-red-50 text-red-600",
    badge: "border-red-200 bg-red-50 text-red-600",
    dot: "bg-red-500",
  },
  "En Revisión": {
    row: "border-blue-200 bg-blue-50 text-blue-600",
    badge: "border-blue-200 bg-blue-50 text-blue-600",
    dot: "bg-blue-500",
  },
  Cerrada: {
    row: "border-emerald-200 bg-emerald-50 text-emerald-600",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
  },
  Archivada: {
    row: "border-slate-200 bg-slate-50 text-slate-500",
    badge: "border-slate-200 bg-slate-50 text-slate-500",
    dot: "bg-slate-400",
  },
};

const PRIORITY_CONFIG: Record<Priority, string> = {
  Alta: "bg-red-100 text-red-700",
  Media: "bg-amber-100 text-amber-700",
  Baja: "bg-slate-100 text-slate-600",
};

const STATUS_TABS: Status[] = ["Nueva", "En Revisión", "Cerrada", "Archivada"];
const ITEMS_PER_PAGE = 8;

export default function DenunciasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "Todas">("Todas");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "Todas">("Todas");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      Todas: mockDenuncias.length,
      Nueva: mockDenuncias.filter((d) => d.status === "Nueva").length,
      "En Revisión": mockDenuncias.filter((d) => d.status === "En Revisión").length,
      Cerrada: mockDenuncias.filter((d) => d.status === "Cerrada").length,
      Archivada: mockDenuncias.filter((d) => d.status === "Archivada").length,
    }),
    []
  );

  const filtered = useMemo(() => {
    return mockDenuncias.filter((d) => {
      const matchSearch =
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.type.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Todas" || d.status === statusFilter;
      const matchPriority = priorityFilter === "Todas" || d.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [search, statusFilter, priorityFilter]);

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const selectedItem = mockDenuncias.find((d) => d.id === selected) ?? null;

  const handleTabChange = (tab: Status | "Todas") => {
    setStatusFilter(tab);
    setPage(1);
    setSelected(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="text-red-500" size={22} />
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Buzón de Denuncias</h1>
          </div>
          <p className="text-slate-500">Gestión y seguimiento de todas las denuncias del canal ético.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-colors text-sm">
          <Download size={15} /> Exportar CSV
        </button>
      </div>

      {/* Main panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabs + Filters */}
        <div className="flex flex-wrap items-center border-b border-slate-100 gap-0">
          {/* All tab */}
          <button
            onClick={() => handleTabChange("Todas")}
            className={`px-5 py-4 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              statusFilter === "Todas"
                ? "text-red-600 border-red-500"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            Todas
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                statusFilter === "Todas"
                  ? "bg-red-100 text-red-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts.Todas}
            </span>
          </button>

          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-4 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
                statusFilter === tab
                  ? "text-red-600 border-red-500"
                  : "text-slate-500 border-transparent hover:text-slate-800"
              }`}
            >
              {tab}
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  statusFilter === tab
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}

          {/* Spacer + controls */}
          <div className="ml-auto flex items-center gap-2 px-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={14}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Código o tipo..."
                className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 w-44"
              />
            </div>
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as Priority | "Todas");
                  setPage(1);
                }}
                className="pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 appearance-none bg-white"
              >
                <option value="Todas">Prioridad</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={13}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Tipo de Denuncia</th>
                <th className="px-6 py-4 font-semibold">Denunciante</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Analista</th>
                <th className="px-6 py-4 font-semibold">Prioridad</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginated.length > 0 ? (
                paginated.map((item) => {
                  const sConf = STATUS_CONFIG[item.status];
                  const pConf = PRIORITY_CONFIG[item.priority];
                  const isSelected = selected === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-700">{item.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-600 max-w-[200px] truncate">
                        {item.type}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                            item.submitter === "Anónimo"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-indigo-50 text-indigo-600"
                          }`}
                        >
                          <User size={11} />
                          {item.submitter}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{item.date}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.analyst ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${pConf}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sConf.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelected(isSelected ? null : item.id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            isSelected
                              ? "bg-red-100 text-red-600"
                              : "text-slate-500 hover:text-red-600 hover:bg-red-50"
                          }`}
                        >
                          <Eye size={13} /> Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400 text-sm">
                    No se encontraron denuncias con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Mostrando{" "}
              {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} resultados
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                    n === page
                      ? "bg-red-600 text-white"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedItem && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800 text-lg">{selectedItem.id}</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  STATUS_CONFIG[selectedItem.status].badge
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedItem.status].dot}`} />
                {selectedItem.status}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoField label="Tipo de infracción" value={selectedItem.type} />
            <InfoField label="Denunciante" value={selectedItem.submitter} />
            <InfoField label="Prioridad" value={selectedItem.priority} />
            <InfoField label="Fecha de ingreso" value={selectedItem.date} />
            <InfoField label="Analista asignado" value={selectedItem.analyst ?? "Sin asignar"} />
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Clock size={15} /> Iniciar Revisión
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <CheckCircle2 size={15} /> Cerrar Denuncia
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-2">
              <AlertTriangle size={15} /> Marcar Urgente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
