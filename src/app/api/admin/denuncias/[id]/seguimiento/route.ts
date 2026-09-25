import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDbProxyClient } from "@/lib/db-proxy-client";
import { verifyToken } from "@/lib/auth";

export async function POST(
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

    const body = await request.json();
    const { estado, nota, esVisibleDenunciante } = body;

    if (!estado || !nota) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    const result = await getDbProxyClient().adminAddFollowup({
      denunciaId: complaintId,
      usuarioId: session.userId,
      estado,
      nota,
      prioridad: body.prioridad || "media",
      esVisibleDenunciante: Boolean(esVisibleDenunciante),
      ipOrigen: ipAddress,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    if (!result.ok) {
      if (result.status === 404) {
        return NextResponse.json({ error: "Denuncia no encontrada" }, { status: 404 });
      }
      if (result.status === 400) {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
      }
      console.error("Error adding complaint follow-up:", result.status, result.error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding complaint follow-up:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
