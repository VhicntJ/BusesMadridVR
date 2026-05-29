// src/app/api/send-job-application/route.ts
import path from "path";
import { put } from "@vercel/blob";

import { validateRequest, errorResponse, successResponse, getClientIp } from "@/lib/security";
import { verifyRecaptcha } from "@/lib/recaptcha-service";
import {
  generateJobApplicationEmailHTML,
  generateJobApplicationAdminEmailHTML,
} from "@/lib/email-service";
import { jobApplicationSchema } from "@/lib/validation-schemas";
import { getDbProxyClient } from "@/lib/db-proxy-client";

const allowedCvMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const allowedCvExtensions = new Set([".pdf", ".doc", ".docx"]);

export async function POST(request: Request) {
  let storedPath: string | null = null;
  try {
    console.log("📥 Job application request received");

    // 0. Verificar variables de entorno críticas
    const requiredEnvVars = [
      "RECAPTCHA_SECRET_KEY",
      "BLOB_READ_WRITE_TOKEN",
      "DB_PROXY_URL",
      "DB_PROXY_API_KEY",
      "SMTP_HOST",
      "SMTP_USER",
      "SMTP_PASSWORD",
      "EMAIL_FROM",
      "EMAIL_JOBS_TO",
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error("❌ Missing environment variables:", missingVars.join(", "));
      return errorResponse(
        `Server configuration error. Missing: ${missingVars.join(", ")}`,
        500
      );
    }

    // 1. Validar solicitud (origen, rate limit, etc)
    const validation = await validateRequest(request, {
      allowedContentTypes: ["multipart/form-data"],
    });
    if (!validation.valid) {
      console.error("❌ Validation failed:", validation.error);
      return errorResponse(validation.error || "Invalid request", 400);
    }

    console.log("✅ Request validation passed");

    // 2. Parsear body (multipart)
    console.log("📝 Parsing form data...");
    const formData = await request.formData();
    const getField = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value : "";
    };
    console.log("✅ Form data parsed");

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
    console.log("🔍 Validating form data with schema...");
    const validationResult = jobApplicationSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("❌ Schema validation failed:", validationResult.error.flatten());
      return errorResponse("Invalid form data", 400, validationResult.error.flatten());
    }

    const validatedData = validationResult.data;
    const ipAddress = getClientIp(request);
    console.log("✅ Schema validation passed");

    // 4. Verificar currículum
    console.log("📄 Checking curriculum file...");
    const curriculum = formData.get("curriculum");
    if (!(curriculum instanceof File)) {
      console.error("❌ Curriculum file not found or invalid");
      return errorResponse("El currículum es obligatorio", 400);
    }
    console.log(`✅ Curriculum file found: ${curriculum.name} (${curriculum.size} bytes)`);

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
    console.log("🔐 Verifying reCAPTCHA...");
    const recaptchaCheck = await verifyRecaptcha(validatedData.recaptchaToken, "job_application");
    if (!recaptchaCheck.success) {
      console.error("❌ reCAPTCHA verification failed:", recaptchaCheck.error);
      return errorResponse("reCAPTCHA verification failed", 400);
    }

    console.log(
      `✅ Job application from ${validatedData.nombres} ${validatedData.apellidos} for position ${validatedData.cargo} (reCAPTCHA score: ${recaptchaCheck.score})`
    );

    // 6. Guardar currículum en Vercel Blob Storage
    console.log("☁️ Uploading curriculum to Vercel Blob...");
    const timestamp = Date.now();
    const normalizedExtension = allowedCvExtensions.has(extension)
      ? extension
      : mimeToExtension[curriculum.type] || ".pdf";

    const blobFileName = `cv/${validatedData.rut.replace(/\./g, '')}_${timestamp}${normalizedExtension}`;

    // Subir a Vercel Blob
    const blob = await put(blobFileName, curriculum, {
      access: "private", // El store está configurado como privado
      addRandomSuffix: false,
      contentType: curriculum.type,
    });

    storedPath = blob.url; // URL de Vercel Blob para guardar en BD
    console.log(`✅ Curriculum uploaded to: ${storedPath}`);

    // 7. Guardar datos en base de datos vía proxy
    console.log("💾 Saving to database via proxy...");
    const dbProxy = getDbProxyClient();

    const dbResult = await dbProxy.insertJobApplication({
      nombres: validatedData.nombres,
      apellidos: validatedData.apellidos,
      rut: validatedData.rut,
      correo: validatedData.correo,
      telefono: validatedData.telefono,
      region: validatedData.region,
      comuna: validatedData.comuna,
      cargo: validatedData.cargo,
      experiencia: validatedData.experiencia,
      licencia: validatedData.licencia || null,
      disponibilidad: validatedData.disponibilidad,
      experiencia_detalle: validatedData.experiencia_detalle,
      notas_internas: `Trabajado antes: ${validatedData.trabajado_antes}`,
      ip_origen: ipAddress,
      cv_url: storedPath,
      cv_original_name: safeOriginalName,
      cv_stored_name: blobFileName,
      cv_mime_type: curriculum.type || "application/octet-stream",
      cv_size: curriculum.size,
    });

    const postulacionId = dbResult.postulacionId;
    console.log(`✅ Database save successful. Postulacion ID: ${postulacionId}`);

    // 8. Generar HTMLs de correos
    console.log("📧 Generating email HTML...");
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

    // 9. Enviar correo de confirmación al postulante vía proxy
    console.log("📨 Sending confirmation email to applicant via proxy...");
    const safeCargo = validatedData.cargo.replace(/[\r\n]+/g, " ").trim();

    await dbProxy.sendEmail({
      to: validatedData.correo,
      subject: "Tu postulación ha sido recibida - Buses Madrid",
      html: userConfirmationHtml,
    });
    console.log(`✅ Confirmation email sent to ${validatedData.correo}`);

    // 10. Enviar correo al equipo de RRHH vía proxy
    console.log("📨 Sending notification email to HR via proxy...");
    const emailTo = process.env.EMAIL_JOBS_TO;
    if (!emailTo) {
      throw new Error("EMAIL_JOBS_TO not configured");
    }

    await dbProxy.sendEmail({
      to: emailTo,
      subject: `Nueva postulación: ${validatedData.nombres} ${validatedData.apellidos} - ${safeCargo}`,
      html: adminEmailHtml,
      replyTo: validatedData.correo,
    });
    console.log(`✅ Notification email sent to ${emailTo}`);

    console.log("🎉 Job application submitted successfully!");
    return successResponse(
      { postulacionId, cvFileName: safeOriginalName },
      "Application submitted successfully"
    );
  } catch (error) {
    // En Vercel Blob, no necesitamos limpiar archivos manualmente en caso de error
    // Los archivos no usados se pueden limpiar después con un cron job si es necesario
    console.error("❌❌❌ FATAL ERROR in job application route:", error);

    // Log detallado del error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return errorResponse("Internal server error", 500);
  }
}
