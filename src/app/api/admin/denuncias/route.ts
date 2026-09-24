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
      ? rows.map((row: any) => ({
          id: Number(row.id),
          codigo: row.codigo,
          tipo: row.tipo,
          descripcion: row.descripcion,
          esAnonima: Boolean(row.es_anonima),
          denuncianteNombre: row.denunciante_nombre,
          denuncianteEmail: row.denunciante_email,
          denuncianteTelefono: row.denunciante_telefono,
          areaInvolucrada: row.area_involucrada,
          estado: row.estado,
          prioridad: row.prioridad,
          resolucion: row.resolucion,
          fechaCierre: row.fecha_cierre,
          creadoEn: row.creado_en,
          actualizadoEn: row.actualizado_en,
          analistaNombre: row.analista_nombre,
        }))
      : [];

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
