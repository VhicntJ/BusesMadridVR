"use client";
import { useEffect, useMemo, useState } from "react";
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
  codigo: string;
  tipo: string;
  tipoLabel: string;
  submitter: "Anónimo" | "Identificado";
  date: string;
  status: Status;
  priority: Priority;
  analyst?: string;
  descripcion?: string;
  denuncianteNombre?: string;
  denuncianteEmail?: string;
  denuncianteTelefono?: string;
  areaInvolucrada?: string;
  estado?: string;
  prioridad?: string;
};

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
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDenuncias() {
      try {
        const response = await fetch("/api/admin/denuncias", { cache: "no-store" });
        if (!response.ok) throw new Error("Error cargando denuncias");
        const data = await response.json();

        const mapped: Denuncia[] = (data.items || []).map((item: Record<string, unknown>) => {
          const statusMap: Record<string, Status> = {
            nueva: "Nueva",
            en_revision: "En Revisión",
            cerrada: "Cerrada",
            archivada: "Archivada",
          };
          const priorityMap: Record<string, Priority> = {
            alta: "Alta",
            media: "Media",
            baja: "Baja",
          };

          const codigo = String(item.codigo ?? item.id ?? "");
          const tipo = typeof item.tipo === "string" ? item.tipo : "No informado";
          const estado = typeof item.estado === "string" ? item.estado : "nueva";
          const prioridad = typeof item.prioridad === "string" ? item.prioridad : "media";
          const creadoEn = item.creadoEn;

          return {
            id: codigo,
            codigo,
            tipo,
            tipoLabel: tipo,
            submitter: item.esAnonima ? "Anónimo" : "Identificado",
            date: creadoEn
              ? new Date(String(creadoEn)).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Sin fecha",
            status: statusMap[estado] || "Nueva",
            priority: priorityMap[prioridad] || "Media",
            analyst: typeof item.analistaNombre === "string" ? item.analistaNombre : undefined,
            descripcion: typeof item.descripcion === "string" ? item.descripcion : undefined,
            denuncianteNombre: typeof item.denuncianteNombre === "string" ? item.denuncianteNombre : undefined,
            denuncianteEmail: typeof item.denuncianteEmail === "string" ? item.denuncianteEmail : undefined,
            denuncianteTelefono: typeof item.denuncianteTelefono === "string" ? item.denuncianteTelefono : undefined,
            areaInvolucrada: typeof item.areaInvolucrada === "string" ? item.areaInvolucrada : undefined,
          };
        });

        setDenuncias(mapped);
      } catch (error) {
        console.error("Error fetching denuncias:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDenuncias();
  }, []);

  const counts = useMemo(
    () => ({
      Todas: denuncias.length,
      Nueva: denuncias.filter((d) => d.status === "Nueva").length,
      "En Revisión": denuncias.filter((d) => d.status === "En Revisión").length,
      Cerrada: denuncias.filter((d) => d.status === "Cerrada").length,
      Archivada: denuncias.filter((d) => d.status === "Archivada").length,
    }),
    [denuncias]
  );

  const filtered = useMemo(() => {
    return denuncias.filter((d) => {
      const matchSearch =
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.tipo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Todas" || d.status === statusFilter;
      const matchPriority = priorityFilter === "Todas" || d.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [denuncias, search, statusFilter, priorityFilter]);

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const selectedItem = denuncias.find((d) => d.id === selected) ?? null;

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
        {loading ? (
          <div className="px-6 py-16 text-center text-slate-500">Cargando denuncias...</div>
        ) : (
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
                        {item.tipo}
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
        )}

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
            <InfoField label="Tipo de infracción" value={selectedItem.tipoLabel || selectedItem.tipo || "No informado"} />
            <InfoField label="Denunciante" value={selectedItem.submitter} />
            <InfoField label="Prioridad" value={selectedItem.priority} />
            <InfoField label="Fecha de ingreso" value={selectedItem.date} />
            <InfoField label="Analista asignado" value={selectedItem.analyst ?? "Sin asignar"} />
            <InfoField label="Área involucrada" value={selectedItem.areaInvolucrada || "No especificada"} />
            <InfoField label="Correo" value={selectedItem.denuncianteEmail || "No informado"} />
            <InfoField label="Teléfono" value={selectedItem.denuncianteTelefono || "No informado"} />
          </div>
          <div className="px-6 pb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Descripción</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
              {selectedItem.descripcion || "Sin descripción registrada."}
            </div>
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
