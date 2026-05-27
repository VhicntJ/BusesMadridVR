// src/app/api/upload-cv/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadCVToBlob } from "@/lib/storage/vercel-blob";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv") as File;
    const applicantId = formData.get("applicantId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    if (!applicantId) {
      return NextResponse.json(
        { error: "ID de postulante requerido" },
        { status: 400 }
      );
    }

    // Subir a Vercel Blob
    const result = await uploadCVToBlob(file, applicantId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
    });
  } catch (error) {
    console.error("Error en upload-cv:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
