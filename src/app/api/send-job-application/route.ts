// src/app/api/send-job-application/route.ts
import path from "path";
import { put } from "@vercel/blob";

import { validateRequest, errorResponse, successResponse, getClientIp } from "@/lib/security";
import { verifyRecaptcha } from "@/lib/recaptcha-service";
import {
  sendEmail,
  generateJobApplicationEmailHTML,
  generateJobApplicationAdminEmailHTML,
} from "@/lib/email-service";
import { jobApplicationSchema } from "@/lib/validation-schemas";
import { getDbPool, type ResultSetHeader } from "@/lib/db";

const allowedCvMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const allowedCvExtensions = new Set([".pdf", ".doc", ".docx"]);

export async function POST(request: Request) {
  let storedPath: string | null = null;
  try {
    // 1. Validar solicitud (origen, rate limit, etc)
    const validation = await validateRequest(request, {
      allowedContentTypes: ["multipart/form-data"],
    });
    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid request", 400);
    }

    // 2. Parsear body (multipart)
    const formData = await request.formData();
    const getField = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value : "";
    };

    const data = {
      nombres: getField("nombres"),
      apellidos: getField("apellidos"),
      rut: getField("rut"),
      correo: getField("correo"),
      telefono: getField("telefono"),
      region: getField("region"),
      comuna: getField("comuna"),
      licencia: getField("licencia"),
      cargo: getField("cargo"),
      experiencia: getField("experiencia"),
      trabajado_antes: getField("trabajado_antes"),
      disponibilidad: getField("disponibilidad"),
      experiencia_detalle: getField("experiencia_detalle"),
      recaptchaToken: getField("recaptchaToken"),
    };

    // 3. Validar schema de Zod
    const validationResult = jobApplicationSchema.safeParse(data);
    if (!validationResult.success) {
      return errorResponse("Invalid form data", 400, validationResult.error.flatten());
    }

    const validatedData = validationResult.data;
    const ipAddress = getClientIp(request);

    // 4. Verificar currículum
    const curriculum = formData.get("curriculum");
    if (!(curriculum instanceof File)) {
      return errorResponse("El currículum es obligatorio", 400);
    }

    const maxSizeMb = parseInt(process.env.CV_MAX_SIZE_MB || "2", 10);
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (curriculum.size > maxSizeBytes) {
      return errorResponse(`El archivo no debe superar ${maxSizeMb}MB`, 400);
    }

    const originalName = curriculum.name || "curriculum";
    const safeOriginalName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const extension = path.extname(safeOriginalName).toLowerCase();
    const mimeToExtension: Record<string, string> = {
      "application/pdf": ".pdf",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    };

    const isTypeAllowed =
      allowedCvMimeTypes.has(curriculum.type) || allowedCvExtensions.has(extension);

    if (!isTypeAllowed) {
      return errorResponse("Solo se aceptan archivos PDF o Word", 400);
    }

    // 5. Verificar reCAPTCHA
    const recaptchaCheck = await verifyRecaptcha(validatedData.recaptchaToken, "job_application");
    if (!recaptchaCheck.success) {
      console.warn("reCAPTCHA verification failed:", recaptchaCheck.error);
      return errorResponse("reCAPTCHA verification failed", 400);
    }

    console.log(
      `Job application from ${validatedData.nombres} ${validatedData.apellidos} for position ${validatedData.cargo} (reCAPTCHA score: ${recaptchaCheck.score})`
    );

    // 6. Guardar currículum en Vercel Blob Storage
    const timestamp = Date.now();
    const normalizedExtension = allowedCvExtensions.has(extension)
      ? extension
      : mimeToExtension[curriculum.type] || ".pdf";

    const blobFileName = `cv/${validatedData.rut.replace(/\./g, '')}_${timestamp}${normalizedExtension}`;

    // Subir a Vercel Blob
    const blob = await put(blobFileName, curriculum, {
      access: "public", // Cambiar a "private" si solo admins deben verlo
      addRandomSuffix: false,
      contentType: curriculum.type,
    });

    storedPath = blob.url; // URL de Vercel Blob para guardar en BD

    // 7. Guardar datos en base de datos (transacción)
    const pool = getDbPool();
    const connection = await pool.getConnection();

    let postulacionId: number | null = null;
    try {
      await connection.beginTransaction();

      const [postulacionResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO bm_postulaciones
          (nombres, apellidos, rut, email, telefono, region, comuna, cargo_postulado, nivel_experiencia,
           licencia_conducir, disponibilidad, mensaje, estado, notas_internas, ip_origen)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'nueva', ?, ?)`
        ,
        [
          validatedData.nombres,
          validatedData.apellidos,
          validatedData.rut,
          validatedData.correo,
          validatedData.telefono,
          validatedData.region,
          validatedData.comuna,
          validatedData.cargo,
          validatedData.experiencia,
          validatedData.licencia || null,
          validatedData.disponibilidad,
          validatedData.experiencia_detalle,
          `Trabajado antes: ${validatedData.trabajado_antes}`,
          ipAddress,
        ]
      );

      postulacionId = postulacionResult.insertId;

      await connection.execute<ResultSetHeader>(
        `INSERT INTO bm_postulaciones_archivos
          (postulacion_id, tipo, nombre_original, nombre_almacenado, ruta, mime_type, tamanio_bytes)
         VALUES (?, 'curriculum', ?, ?, ?, ?, ?)`
        ,
        [
          postulacionId,
          safeOriginalName,
          blobFileName,
          storedPath, // URL de Vercel Blob
          curriculum.type || "application/octet-stream",
          curriculum.size,
        ]
      );

      await connection.commit();
    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }

    // 7. Generar HTMLs de correos
    const userConfirmationHtml = generateJobApplicationEmailHTML({
      nombres: validatedData.nombres,
      apellidos: validatedData.apellidos,
      correo: validatedData.correo,
      cargo: validatedData.cargo,
    });

    const adminEmailHtml = generateJobApplicationAdminEmailHTML({
      ...validatedData,
      cvFileName: safeOriginalName,
      cvStoragePath: storedPath,
    });

    // 8. Enviar correo de confirmación al postulante
    const safeCargo = validatedData.cargo.replace(/[\r\n]+/g, " ").trim();

    await sendEmail({
      to: validatedData.correo,
      subject: "Tu postulación ha sido recibida - Buses Madrid",
      html: userConfirmationHtml,
    });

    // 9. Enviar correo al equipo de RRHH
    const emailTo = process.env.EMAIL_JOBS_TO;
    if (!emailTo) {
      throw new Error("EMAIL_JOBS_TO not configured");
    }

    await sendEmail({
      to: emailTo,
      subject: `Nueva postulación: ${validatedData.nombres} ${validatedData.apellidos} - ${safeCargo}`,
      html: adminEmailHtml,
      replyTo: validatedData.correo,
    });

    return successResponse(
      { postulacionId, cvFileName: safeOriginalName },
      "Application submitted successfully"
    );
  } catch (error) {
    // En Vercel Blob, no necesitamos limpiar archivos manualmente en caso de error
    // Los archivos no usados se pueden limpiar después con un cron job si es necesario
    console.error("Error in job application route:", error);
    return errorResponse("Internal server error", 500);
  }
}
