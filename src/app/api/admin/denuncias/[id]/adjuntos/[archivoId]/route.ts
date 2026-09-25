// src/app/api/admin/denuncias/[id]/adjuntos/[archivoId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDbProxyClient } from "@/lib/db-proxy-client";
import { getPrivateBlobUrl } from "@/lib/blob-download";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; archivoId: string }> }
) {
  const { id, archivoId } = await params;

  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denunciaId = Number(id);
    const fileId = Number(archivoId);
    if (!Number.isInteger(denunciaId) || denunciaId <= 0 || !Number.isInteger(fileId) || fileId <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const result = await getDbProxyClient().adminGetComplaintFile(denunciaId, fileId);

    if (!result.ok) {
      if (result.status === 404) {
        return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
      }
      console.error("Error downloading complaint file:", result.status, result.error);
      return NextResponse.json({ error: "Error al descargar el adjunto" }, { status: 500 });
    }

    const signedUrl = await getPrivateBlobUrl(result.data.ruta);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Error downloading complaint file:", error);
    return NextResponse.json({ error: "Error al descargar el adjunto" }, { status: 500 });
  }
}
