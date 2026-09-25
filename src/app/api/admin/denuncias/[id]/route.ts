import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDbProxyClient } from "@/lib/db-proxy-client";
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
    const complaintId = Number(id);

    if (!Number.isInteger(complaintId) || complaintId <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const result = await getDbProxyClient().adminGetComplaint(complaintId);

    if (!result.ok) {
      if (result.status === 404) {
        return NextResponse.json({ error: "Denuncia no encontrada" }, { status: 404 });
      }
      console.error("Error fetching complaint detail:", result.status, result.error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }

    const denuncia = result.data.item;
    const archivos = result.data.archivos;
    const seguimiento = result.data.seguimiento;

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
      archivos,
      seguimiento,
    });
  } catch (error) {
    console.error("Error fetching complaint detail:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
