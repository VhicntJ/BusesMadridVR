// src/app/api/send-contact-email/route.ts
import { validateRequest, errorResponse, successResponse, getClientIp } from "@/lib/security";
import { verifyRecaptcha } from "@/lib/recaptcha-service";
import { sendEmail, generateContactEmailHTML, escapeHtml } from "@/lib/email-service";
import { contactFormSchema } from "@/lib/validation-schemas";
import { getDbPool, type ResultSetHeader } from "@/lib/db";

export async function POST(request: Request) {
  try {
    // 1. Validar solicitud (origen, rate limit, etc)
    const validation = await validateRequest(request);
    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid request", 400);
    }

    // 2. Parsear body
    const body = await request.json();

    // 3. Validar schema de Zod
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse("Invalid form data", 400, validationResult.error.flatten());
    }

    const data = validationResult.data;
    const ipAddress = getClientIp(request);

    // 4. Verificar reCAPTCHA
    const recaptchaCheck = await verifyRecaptcha(data.recaptchaToken, "contact");
    if (!recaptchaCheck.success) {
      console.warn("reCAPTCHA verification failed:", recaptchaCheck.error);
      return errorResponse("reCAPTCHA verification failed", 400);
    }

    console.log(`Contact form submission from ${data.correo} (reCAPTCHA score: ${recaptchaCheck.score})`);

    // 5. Generar HTML del correo
    const emailHtml = generateContactEmailHTML(data);

    // 6. Enviar correo al equipo
    const emailTo = process.env.EMAIL_CONTACT_TO;
    if (!emailTo) {
      throw new Error("EMAIL_CONTACT_TO not configured");
    }

    const safeSubject = data.asunto.replace(/[\r\n]+/g, " ").trim();

    const pool = getDbPool();
    await pool.execute<ResultSetHeader>(
      `INSERT INTO bm_contacto_mensajes
        (nombre, email, telefono, empresa, asunto, mensaje, leido, respondido, ip_origen)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)`
      ,
      [
        data.nombre,
        data.correo,
        data.telefono || null,
        null,
        data.asunto,
        data.mensaje,
        ipAddress,
      ]
    );

    await sendEmail({
      to: emailTo,
      subject: `Nuevo mensaje de contacto: ${safeSubject}`,
      html: emailHtml,
      replyTo: data.correo,
    });

    // 7. Enviar correo de confirmación al usuario
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; }
              .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; border: 1px solid #e5e7eb; }
              .message { color: #4b5563; line-height: 1.6; }
              .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Hemos recibido tu mensaje</h1>
              </div>
              <div class="content">
                  <div class="message">
                        <p>Hola ${escapeHtml(data.nombre)},</p>
                      <p>Agradecemos tu contacto. Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.</p>
                        <p><strong>Asunto:</strong> ${escapeHtml(data.asunto)}</p>
                      <p>Uno de nuestros representantes te responderá en los próximos días de negocio.</p>
                  </div>
              </div>
              <div class="footer">
                  <p>Buses Madrid - Departamento de Atención al Cliente</p>
              </div>
          </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: data.correo,
      subject: "Hemos recibido tu mensaje - Buses Madrid",
      html: confirmationHtml,
    });

    return successResponse(null, "Email sent successfully");
  } catch (error) {
    console.error("Error in contact email route:", error);
    return errorResponse("Internal server error", 500);
  }
}
