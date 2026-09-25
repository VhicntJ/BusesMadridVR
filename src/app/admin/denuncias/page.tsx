"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  History,
  Paperclip,
} from "lucide-react";

type Status = "Nueva" | "En Revisión" | "Cerrada" | "Archivada";
type Priority = "Alta" | "Media" | "Baja";
type ActionKind = "revision" | "cerrar" | "urgente";

type Denuncia = {
  id: string;
  codigo: string;
  tipo: string;
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
  estado: string;
  prioridad: string;
};

type Seguimiento = {
  id: number;
  estado_anterior: string | null;
  estado_nuevo: string | null;
  nota: string | null;
  es_visible_denunciante: number | boolean;
  creado_en: string;
  usuario_nombre: string | null;
};

type Archivo = {
  id: number;
  nombre_original: string;
  mime_type: string;
  tamanio_bytes: number;
  creado_en: string;
};

type Detail = {
  item: Record<string, unknown>;
  seguimiento: Seguimiento[];
  archivos: Archivo[];
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

const ESTADO_LABELS: Record<string, string> = {
  nueva: "Nueva",
  en_revision: "En Revisión",
  cerrada: "Cerrada",
  archivada: "Archivada",
};

function formatDate(value: unknown): string {
  if (!value) return "Sin fecha";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value: unknown): string {
  if (!value) return "—";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DenunciasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "Todas">("Todas");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "Todas">("Todas");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionModal, setActionModal] = useState<ActionKind | null>(null);
  const [actionForm, setActionForm] = useState({
    estado: "en_revision",
    prioridad: "media",
    nota: "",
    visible: false,
  });
  const [actionSaving, setActionSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDenuncias = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/denuncias", { cache: "no-store" });
      if (!response.ok) throw new Error("Error cargando denuncias");
      const data = await response.json();

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

      const mapped: Denuncia[] = (data.items || []).map((item: Record<string, unknown>) => {
        const tipo = typeof item.tipo === "string" ? item.tipo : "No informado";
        const estado = typeof item.estado === "string" ? item.estado : "nueva";
        const prioridad = typeof item.prioridad === "string" ? item.prioridad : "media";

        return {
          id: String(item.id ?? ""),
          codigo: String(item.codigo ?? item.id ?? ""),
          tipo,
          submitter: item.esAnonima ? "Anónimo" : "Identificado",
          date: formatDate(item.creadoEn),
          status: statusMap[estado] || "Nueva",
          priority: priorityMap[prioridad] || "Media",
          analyst: typeof item.analistaNombre === "string" ? item.analistaNombre : undefined,
          descripcion: typeof item.descripcion === "string" ? item.descripcion : undefined,
          denuncianteNombre:
            typeof item.denuncianteNombre === "string" ? item.denuncianteNombre : undefined,
          denuncianteEmail:
            typeof item.denuncianteEmail === "string" ? item.denuncianteEmail : undefined,
          denuncianteTelefono:
            typeof item.denuncianteTelefono === "string" ? item.denuncianteTelefono : undefined,
          areaInvolucrada:
            typeof item.areaInvolucrada === "string" ? item.areaInvolucrada : undefined,
          estado,
          prioridad,
        };
      });

      setDenuncias(mapped);
    } catch (error) {
      console.error("Error fetching denuncias:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDenuncias();
  }, [loadDenuncias]);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/denuncias/${id}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Error cargando detalle");
      const data = await response.json();
      setDetail({ item: data.item, seguimiento: data.seguimiento || [], archivos: data.archivos || [] });
    } catch (error) {
      console.error("Error fetching detail:", error);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    loadDetail(selected);
  }, [selected, loadDetail]);

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
      const term = search.toLowerCase();
      const matchSearch =
        d.codigo.toLowerCase().includes(term) || d.tipo.toLowerCase().includes(term);
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

  function openAction(kind: ActionKind) {
    if (!selectedItem) return;
    setActionError("");
    if (kind === "revision") {
      setActionForm({ estado: "en_revision", prioridad: selectedItem.prioridad, nota: "", visible: false });
    } else if (kind === "cerrar") {
      setActionForm({ estado: "cerrada", prioridad: selectedItem.prioridad, nota: "", visible: false });
    } else {
      setActionForm({
        estado: selectedItem.estado,
        prioridad: "alta",
        nota: "Marcado como urgente por el equipo.",
        visible: false,
      });
    }
    setActionModal(kind);
  }

  async function submitAction(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setActionError("");
    setActionSaving(true);

    try {
      const response = await fetch(`/api/admin/denuncias/${selected}/seguimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: actionForm.estado,
          prioridad: actionForm.prioridad,
          nota: actionForm.nota,
          esVisibleDenunciante: actionForm.visible,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setActionError(data.error || "Error al guardar el seguimiento");
        return;
      }

      setActionModal(null);
      setNotice("Seguimiento registrado correctamente.");
      setTimeout(() => setNotice(""), 4000);
      await Promise.all([loadDenuncias(), loadDetail(selected)]);
    } catch {
      setActionError("Error de conexión. Intenta de nuevo.");
    } finally {
      setActionSaving(false);
    }
  }

  function exportCsv() {
    const headers = [
      "Codigo",
      "Tipo",
      "Denunciante",
      "Fecha",
      "Analista",
      "Prioridad",
      "Estado",
      "Descripcion",
    ];
    const rows = filtered.map((d) => [
      d.codigo,
      d.tipo,
      d.submitter,
      d.date,
      d.analyst ?? "Sin asignar",
      d.priority,
      d.status,
      d.descripcion ?? "",
    ]);
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv =
      "\ufeff" +
      [headers, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `denuncias-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const detailItem = detail?.item;
  const currentEstado =
    detailItem && typeof detailItem.estado === "string" ? detailItem.estado : selectedItem?.estado;
  const currentPrioridad =
    detailItem && typeof detailItem.prioridad === "string"
      ? detailItem.prioridad
      : selectedItem?.prioridad;

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
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <Download size={15} /> Exportar CSV
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      {/* Main panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabs + Filters */}
        <div className="flex flex-wrap items-center border-b border-slate-100 gap-0">
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
                statusFilter === "Todas" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
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
                  statusFilter === tab ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
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
                        <td className="px-6 py-4 font-bold text-slate-700">{item.codigo}</td>
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
              Mostrando {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
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
                    n === page ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-200"
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
              <span className="font-bold text-slate-800 text-lg">{selectedItem.codigo}</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  STATUS_CONFIG[selectedItem.status].badge
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedItem.status].dot}`} />
                {selectedItem.status}
              </span>
              {detailLoading && <span className="text-xs text-slate-400">Cargando detalle...</span>}
            </div>
            <button
              onClick={() => setSelected(null)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoField
              label="Tipo de infracción"
              value={String(detailItem?.tipo ?? selectedItem.tipo ?? "No informado")}
            />
            <InfoField
              label="Denunciante"
              value={
                detailItem?.denuncianteNombre
                  ? String(detailItem.denuncianteNombre)
                  : selectedItem.submitter
              }
            />
            <InfoField
              label="Prioridad"
              value={String(currentPrioridad ?? "media").charAt(0).toUpperCase() + String(currentPrioridad ?? "media").slice(1).toLowerCase()}
            />
            <InfoField
              label="Fecha de ingreso"
              value={detailItem?.creado_en ? formatDate(detailItem.creado_en) : selectedItem.date}
            />
            <InfoField
              label="Analista asignado"
              value={
                typeof detailItem?.analista_nombre === "string" && detailItem.analista_nombre
                  ? detailItem.analista_nombre
                  : selectedItem.analyst ?? "Sin asignar"
              }
            />
            <InfoField
              label="Área involucrada"
              value={String(detailItem?.area_involucrada ?? selectedItem.areaInvolucrada ?? "No especificada")}
            />
            <InfoField
              label="Correo"
              value={String(detailItem?.denunciante_email ?? selectedItem.denuncianteEmail ?? "No informado")}
            />
            <InfoField
              label="Teléfono"
              value={String(detailItem?.denunciante_telefono ?? selectedItem.denuncianteTelefono ?? "No informado")}
            />
            <InfoField
              label="Estado actual"
              value={ESTADO_LABELS[currentEstado ?? "nueva"] ?? String(currentEstado ?? "Nueva")}
            />
          </div>

          <div className="px-6 pb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Descripción</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
              {String(detailItem?.descripcion ?? selectedItem.descripcion ?? "Sin descripción registrada.")}
            </div>
          </div>

          {detail && detail.archivos.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Archivos adjuntos
              </p>
              <ul className="space-y-2">
                {detail.archivos.map((archivo) => (
                  <li
                    key={archivo.id}
                    className="flex items-center gap-2 text-sm text-slate-600 rounded-xl border border-slate-200 px-4 py-2.5"
                  >
                    <Paperclip size={14} className="text-slate-400" />
                    {archivo.nombre_original}
                    <span className="text-xs text-slate-400 ml-auto">
                      {Math.max(1, Math.round(archivo.tamanio_bytes / 1024))} KB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="px-6 pb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <History size={14} /> Historial de seguimiento
            </p>
            {detailLoading ? (
              <p className="text-sm text-slate-400">Cargando historial...</p>
            ) : !detail || detail.seguimiento.length === 0 ? (
              <p className="text-sm text-slate-400">Sin seguimientos registrados.</p>
            ) : (
              <ul className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-slate-200">
                {detail.seguimiento.map((entry) => (
                  <li key={entry.id} className="relative pl-7">
                    <span className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                    <p className="text-sm font-semibold text-slate-800">
                      {ESTADO_LABELS[entry.estado_anterior ?? ""] ?? entry.estado_anterior ?? "—"} →{" "}
                      {ESTADO_LABELS[entry.estado_nuevo ?? ""] ?? entry.estado_nuevo ?? "—"}
                      {entry.usuario_nombre && (
                        <span className="text-slate-500 font-normal"> · {entry.usuario_nombre}</span>
                      )}
                    </p>
                    {entry.nota && <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{entry.nota}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateTime(entry.creado_en)}
                      {entry.es_visible_denunciante ? " · Visible para el denunciante" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-6 pb-6 flex flex-wrap gap-3">
            <button
              onClick={() => openAction("revision")}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Clock size={15} /> Iniciar Revisión
            </button>
            <button
              onClick={() => openAction("cerrar")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 size={15} /> Cerrar Denuncia
            </button>
            <button
              onClick={() => openAction("urgente")}
              className="px-4 py-2 bg-white border border-slate-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <AlertTriangle size={15} /> Marcar Urgente
            </button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {actionModal === "revision" && "Iniciar Revisión"}
                {actionModal === "cerrar" && "Cerrar Denuncia"}
                {actionModal === "urgente" && "Marcar como Urgente"}
                <span className="text-slate-400 font-medium"> · {selectedItem.codigo}</span>
              </h2>
              <button
                onClick={() => setActionModal(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitAction}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado</label>
                    <select
                      value={actionForm.estado}
                      onChange={(e) => setActionForm({ ...actionForm, estado: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
                    >
                      <option value="nueva">Nueva</option>
                      <option value="en_revision">En Revisión</option>
                      <option value="cerrada">Cerrada</option>
                      <option value="archivada">Archivada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prioridad</label>
                    <select
                      value={actionForm.prioridad}
                      onChange={(e) => setActionForm({ ...actionForm, prioridad: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nota de seguimiento
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={actionForm.nota}
                    onChange={(e) => setActionForm({ ...actionForm, nota: e.target.value })}
                    placeholder="Describe la acción realizada..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={actionForm.visible}
                    onChange={(e) => setActionForm({ ...actionForm, visible: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  Visible para el denunciante en el portal de seguimiento
                </label>
                {actionError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {actionError}
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionSaving}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {actionSaving ? "Guardando..." : "Guardar seguimiento"}
                </button>
              </div>
            </form>
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
