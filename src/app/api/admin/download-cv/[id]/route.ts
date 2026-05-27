// src/app/api/admin/download-cv/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDbPool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 2. Obtener información del archivo
    const pool = getDbPool();
    const [rows] = await pool.query(
      `SELECT nombre_original, ruta, mime_type
       FROM bm_postulaciones_archivos
       WHERE id = ? AND tipo = 'curriculum'`,
      [params.id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "CV no encontrado" }, { status: 404 });
    }

    const file = rows[0] as any;
    const blobUrl = file.ruta; // URL de Vercel Blob

    // 3. Redirigir a la URL del blob
    // Con access: "public", el archivo es accesible directamente
    return NextResponse.redirect(blobUrl);

    // Alternativa: Fetch y devolver el archivo (más control)
    /*
    const response = await fetch(blobUrl);
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": file.mime_type,
        "Content-Disposition": `attachment; filename="${file.nombre_original}"`,
      },
    });
    */
  } catch (error) {
    console.error("Error downloading CV:", error);
    return NextResponse.json(
      { error: "Error al descargar el currículum" },
      { status: 500 }
    );
  }
}
