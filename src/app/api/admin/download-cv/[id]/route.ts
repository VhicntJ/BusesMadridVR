// src/app/api/admin/download-cv/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDbProxyClient } from "@/lib/db-proxy-client";
import { getPrivateBlobUrl } from "@/lib/blob-download";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 1. Verificar autenticación
    const token = request.cookies.get("bm_admin_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const fileId = Number(id);
    if (!Number.isInteger(fileId) || fileId <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // 2. Obtener información del archivo vía proxy
    const result = await getDbProxyClient().adminGetCv(fileId);

    if (!result.ok) {
      if (result.status === 404) {
        return NextResponse.json({ error: "CV no encontrado" }, { status: 404 });
      }
      console.error("Error downloading CV:", result.status, result.error);
      return NextResponse.json({ error: "Error al descargar el currículum" }, { status: 500 });
    }

    // 3. Redirigir a una URL firmada temporal del blob privado
    const signedUrl = await getPrivateBlobUrl(result.data.ruta);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Error downloading CV:", error);
    return NextResponse.json(
      { error: "Error al descargar el currículum" },
      { status: 500 }
    );
  }
}
