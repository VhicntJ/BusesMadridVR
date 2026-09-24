import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const pool = getDbPool();

    const [denunciaRows] = await pool.query(
      `
        SELECT d.*, u.nombre AS analista_nombre
        FROM bm_denuncias d
        LEFT JOIN bm_usuarios u ON u.id = d.analista_id
        WHERE d.id = ?
      `,
      [id]
    );

    if (!Array.isArray(denunciaRows) || denunciaRows.length === 0) {
      return NextResponse.json({ error: "Denuncia no encontrada" }, { status: 404 });
    }

    const denuncia = denunciaRows[0] as any;

    const [archivoRows] = await pool.query(
      `
        SELECT id, nombre_original, nombre_almacenado, ruta, mime_type, tamanio_bytes, creado_en
        FROM bm_denuncias_archivos
        WHERE denuncia_id = ?
        ORDER BY creado_en DESC
      `,
      [id]
    );

    const [seguimientoRows] = await pool.query(
      `
        SELECT s.*, u.nombre AS usuario_nombre
        FROM bm_denuncias_seguimiento s
        LEFT JOIN bm_usuarios u ON u.id = s.usuario_id
        WHERE s.denuncia_id = ?
        ORDER BY s.creado_en DESC
      `,
      [id]
    );

    return NextResponse.json({
      item: {
        id: Number(denuncia.id),
        codigo: denuncia.codigo,
        tipo: denuncia.tipo,
        descripcion: denuncia.descripcion,
        esAnonima: Boolean(denuncia.es_anonima),
        denuncianteNombre: denuncia.denunciante_nombre,
        denuncianteEmail: denuncia.denunciante_email,
        denuncianteTelefono: denuncia.denunciante_telefono,
        areaInvolucrada: denuncia.area_involucrada,
        estado: denuncia.estado,
        prioridad: denuncia.prioridad,
        resolucion: denuncia.resolucion,
        fechaCierre: denuncia.fecha_cierre,
        creadoEn: denuncia.creado_en,
        actualizadoEn: denuncia.actualizado_en,
        analistaNombre: denuncia.analista_nombre,
      },
      archivos: Array.isArray(archivoRows) ? archivoRows : [],
      seguimiento: Array.isArray(seguimientoRows) ? seguimientoRows : [],
    });
  } catch (error) {
    console.error("Error fetching complaint detail:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
