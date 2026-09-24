import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
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

    const pool = getDbPool();
    const [rows] = await pool.query(
      `
        SELECT
          d.id,
          d.codigo,
          d.tipo,
          d.descripcion,
          d.es_anonima,
          d.denunciante_nombre,
          d.denunciante_email,
          d.denunciante_telefono,
          d.area_involucrada,
          d.estado,
          d.prioridad,
          d.resolucion,
          d.fecha_cierre,
          d.creado_en,
          d.actualizado_en,
          u.nombre AS analista_nombre
        FROM bm_denuncias d
        LEFT JOIN bm_usuarios u ON u.id = d.analista_id
        ORDER BY d.creado_en DESC
      `
    );

    const items = Array.isArray(rows)
      ? (rows as Array<Record<string, unknown>>).map((row) => ({
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
        }))
      : [];

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
