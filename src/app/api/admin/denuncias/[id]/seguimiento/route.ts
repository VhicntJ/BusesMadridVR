import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
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
    const body = await request.json();
    const { estado, nota, esVisibleDenunciante } = body;

    if (!estado || !nota) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const pool = getDbPool();
    await pool.execute(
      `
        INSERT INTO bm_denuncias_seguimiento (denuncia_id, usuario_id, estado_anterior, estado_nuevo, nota, es_visible_denunciante)
        VALUES (?, ?, (SELECT estado FROM bm_denuncias WHERE id = ?), ?, ?, ?)
      `,
      [id, session.userId, id, estado, nota, esVisibleDenunciante ? 1 : 0]
    );

    await pool.execute(
      `UPDATE bm_denuncias SET estado = ?, prioridad = ?, actualizado_en = NOW() WHERE id = ?`,
      [estado, body.prioridad || "media", id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding complaint follow-up:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
