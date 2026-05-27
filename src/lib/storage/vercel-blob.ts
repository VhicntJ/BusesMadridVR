// src/lib/storage/vercel-blob.ts
import { put, del } from "@vercel/blob";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  filename?: string;
}

/**
 * Sube un CV a Vercel Blob Storage
 */
export async function uploadCVToBlob(
  file: File,
  applicantId: string
): Promise<UploadResult> {
  try {
    // Validar tamaño (2MB máximo)
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        success: false,
        error: "El archivo excede el tamaño máximo de 2MB",
      };
    }

    // Validar tipo de archivo
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Solo se permiten archivos PDF o Word",
      };
    }

    // Generar nombre único
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `cv/${applicantId}_${timestamp}_${safeFilename}`;

    // Subir a Vercel Blob
    const blob = await put(filename, file, {
      access: "public", // O "private" si solo admins deben verlo
      addRandomSuffix: false,
    });

    return {
      success: true,
      url: blob.url,
      filename: filename,
    };
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    return {
      success: false,
      error: "Error al subir el archivo",
    };
  }
}

/**
 * Elimina un CV de Vercel Blob Storage
 */
export async function deleteCVFromBlob(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error("Error deleting from Vercel Blob:", error);
    return false;
  }
}

/**
 * Genera una URL temporal para descargar (si usas access: "private")
 */
export function getTemporaryDownloadURL(blobUrl: string): string {
  // Con access: "public", la URL ya es accesible
  // Con access: "private", necesitarías generar signed URL
  return blobUrl;
}
