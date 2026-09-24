import path from "path";
import { put } from "@vercel/blob";

import { validateRequest, errorResponse, successResponse, getClientIp } from "@/lib/security";
import { complaintFormSchema } from "@/lib/validation-schemas";
import { getDbProxyClient } from "@/lib/db-proxy-client";
import { sendEmail, escapeHtml } from "@/lib/email-service";

const allowedComplaintMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const allowedComplaintExtensions = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp"]);

function normalizeComplaintType(value: string): string {
  const map: Record<string, string> = {
    "infraccion a ley 20.393": "infraccion_ley_20393",
    "infracción a ley 20.393": "infraccion_ley_20393",
    "acoso laboral": "acoso_laboral",
    "acoso sexual": "acoso_sexual",
    "robo o hurto": "robo_hurto_fraude",
    "robo, hurto o fraude": "robo_hurto_fraude",
    "conflicto de interes": "conflicto_interes",
    "conflicto de interés": "conflicto_interes",
    "negligencia": "negligencia",
    "otro": "otro",
    "otro incumplimiento ético": "otro",
  };

  return map[value.trim().toLowerCase()] ?? "otro";
}

export async function POST(request: Request) {
  let attachmentUrl: string | null = null;

  try {
    const requiredEnvVars = [
      "BLOB_READ_WRITE_TOKEN",
      "DB_PROXY_URL",
      "DB_PROXY_API_KEY",
      "SMTP_HOST",
      "SMTP_USER",
      "SMTP_PASSWORD",
      "EMAIL_FROM",
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      return errorResponse(
        `Server configuration error. Missing: ${missingVars.join(", ")}`,
        500
      );
    }

    const validation = await validateRequest(request, {
      allowedContentTypes: ["multipart/form-data"],
    });
    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid request", 400);
    }

    const formData = await request.formData();
    const getField = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value : "";
    };

    const data = {
      tipoDenuncia: getField("tipoDenuncia"),
      tipoEnvio: getField("tipoEnvio") === "con_datos" ? "con_datos" : "anonimo",
      nombre: getField("nombre"),
      rut: getField("rut"),
      celular: getField("celular"),
      correo: getField("correo"),
      lugar: getField("lugar"),
      detalle: getField("detalle"),
    };

    const validationResult = complaintFormSchema.safeParse(data);
    if (!validationResult.success) {
      return errorResponse("Invalid form data", 400, validationResult.error.flatten());
    }

    const validatedData = validationResult.data;
    const ipAddress = getClientIp(request);

    const archivo = formData.get("archivo");
    if (archivo instanceof File && archivo.size > 0) {
      const maxSizeMb = parseInt(process.env.COMPLAINT_MAX_SIZE_MB || "5", 10);
      const maxSizeBytes = maxSizeMb * 1024 * 1024;

      if (archivo.size > maxSizeBytes) {
        return errorResponse(`El archivo no debe superar ${maxSizeMb}MB`, 400);
      }

      const originalName = archivo.name || "evidencia";
      const safeOriginalName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const extension = path.extname(safeOriginalName).toLowerCase();
      const mimeToExtension: Record<string, string> = {
        "application/pdf": ".pdf",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
      };

      const isTypeAllowed =
        allowedComplaintMimeTypes.has(archivo.type) || allowedComplaintExtensions.has(extension);

      if (!isTypeAllowed) {
        return errorResponse("El archivo adjunto no tiene un formato válido", 400);
      }

      const normalizedExtension = allowedComplaintExtensions.has(extension)
        ? extension
        : mimeToExtension[archivo.type] || ".pdf";

      const blob = await put(`denuncias/${Date.now()}_${safeOriginalName.replace(/\.[^.]+$/, "")}${normalizedExtension}`, archivo, {
        access: "public",
        addRandomSuffix: false,
        contentType: archivo.type || "application/octet-stream",
      });

      attachmentUrl = blob.url;
    }

    const dbProxy = getDbProxyClient();
    const dbResult = await dbProxy.insertComplaint({
      tipo: normalizeComplaintType(validatedData.tipoDenuncia),
      descripcion: validatedData.detalle,
      lugar: validatedData.lugar,
      es_anonima: validatedData.tipoEnvio === "anonimo" ? 1 : 0,
      nombre: validatedData.tipoEnvio === "con_datos" ? validatedData.nombre : undefined,
      correo: validatedData.tipoEnvio === "con_datos" ? validatedData.correo : undefined,
      celular: validatedData.tipoEnvio === "con_datos" ? validatedData.celular : undefined,
      rut: validatedData.tipoEnvio === "con_datos" ? validatedData.rut : undefined,
      tipoEnvio: validatedData.tipoEnvio,
      ip_origen: ipAddress,
      archivo_url: attachmentUrl ?? undefined,
      archivo_nombre: archivo instanceof File && archivo.size > 0 ? archivo.name : undefined,
      archivo_mime: archivo instanceof File && archivo.size > 0 ? archivo.type : undefined,
    });

    if (validatedData.tipoEnvio === "con_datos" && validatedData.correo) {
      const confirmationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 640px; margin: 0 auto; padding: 24px; }
            .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background: #ffffff; }
            .header { background: #7f1d1d; color: white; padding: 20px; border-radius: 12px 12px 0 0; }
            .content { padding: 24px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 0 0 12px 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Hemos recibido tu denuncia</h2>
            </div>
            <div class="content">
              <p>Hola ${escapeHtml(validatedData.nombre || "")},</p>
              <p>Gracias por comunicar esta situación. Tu denuncia ha sido registrada con éxito en nuestro canal ético.</p>
              <p><strong>Código de seguimiento:</strong> ${escapeHtml(dbResult.codigo)}</p>
              <p>La información será revisada por el comité correspondiente y se te contactará si es necesario.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: validatedData.correo,
        subject: "Hemos recibido tu denuncia - Buses Madrid",
        html: confirmationHtml,
      });
    }

    return successResponse(
      { codigo: dbResult.codigo, denunciaId: dbResult.denunciaId },
      "Complaint submitted successfully"
    );
  } catch (error) {
    console.error("Complaint submission error:", error);
    return errorResponse("Internal server error", 500);
  }
}
