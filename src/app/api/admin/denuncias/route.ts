import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDbProxyClient } from "@/lib/db-proxy-client";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bm_admin_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getDbProxyClient().adminListComplaints();

    if (!result.ok) {
      console.error("Error fetching complaints:", result.status, result.error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }

    const items = result.data.map((row) => ({
          id: Number(row.id ?? 0),
          codigo: typeof row.codigo === "string" ? row.codigo : "",
          tipo: typeof row.tipo === "string" ? row.tipo : "",
          descripcion: typeof row.descripcion === "string" ? row.descripcion : "",
          esAnonima: Boolean(row.es_anonima),
          denuncianteNombre: typeof row.denunciante_nombre === "string" ? row.denunciante_nombre : null,
          denuncianteEmail: typeof row.denunciante_email === "string" ? row.denunciante_email : null,
          denuncianteTelefono: typeof row.denunciante_telefono === "string" ? row.denunciante_telefono : null,
          areaInvolucrada: typeof row.area_involucrada === "string" ? row.area_involucrada : null,
          estado: typeof row.estado === "string" ? row.estado : null,
          prioridad: typeof row.prioridad === "string" ? row.prioridad : null,
          resolucion: typeof row.resolucion === "string" ? row.resolucion : null,
          fechaCierre: row.fecha_cierre ?? null,
          creadoEn: row.creado_en ?? null,
          actualizadoEn: row.actualizado_en ?? null,
          analistaNombre: typeof row.analista_nombre === "string" ? row.analista_nombre : null,
        }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
