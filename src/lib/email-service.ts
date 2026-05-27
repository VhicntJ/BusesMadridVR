// src/lib/email-service.ts
import nodemailer, { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

let transporter: Transporter | null = null;

/**
 * Inicializa el transportador de nodemailer con configuración de cPanel SMTP
 */
function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    throw new Error(
      "SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env.local"
    );
  }

  const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;
  const requireTLS = process.env.SMTP_REQUIRE_TLS
    ? process.env.SMTP_REQUIRE_TLS === "true"
    : smtpPort === 587;
  const allowInvalidCerts = process.env.SMTP_ALLOW_INVALID_CERTS === "true";

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    ...(allowInvalidCerts
      ? {
          tls: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  });

  return transporter;
}

/**
 * Envía un correo electrónico
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const emailFrom = process.env.EMAIL_FROM;

    if (!emailFrom) {
      throw new Error("EMAIL_FROM not configured");
    }

    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || emailFrom,
    });

    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Genera HTML para correo de contacto
 */
export function generateContactEmailHTML(data: {
  nombre: string;
  correo: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1f2937; }
            .value { color: #4b5563; }
            .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Nuevo mensaje de contacto</h1>
            </div>
            <div class="content">
                <div class="field">
                    <span class="label">Nombre:</span><br>
                    <span class="value">${escapeHtml(data.nombre)}</span>
                </div>
                <div class="field">
                    <span class="label">Correo:</span><br>
                    <span class="value">${escapeHtml(data.correo)}</span>
                </div>
                <div class="field">
                    <span class="label">Teléfono:</span><br>
                    <span class="value">${escapeHtml(data.telefono)}</span>
                </div>
                <div class="field">
                    <span class="label">Asunto:</span><br>
                    <span class="value">${escapeHtml(data.asunto)}</span>
                </div>
                <div class="field">
                    <span class="label">Mensaje:</span><br>
                    <span class="value">${escapeHtml(data.mensaje).replace(/\n/g, "<br>")}</span>
                </div>
            </div>
            <div class="footer">
                <p>Este correo fue enviado desde el formulario de contacto de Buses Madrid</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Genera HTML para correo de confirmación de postulación
 */
export function generateJobApplicationEmailHTML(data: {
  nombres: string;
  apellidos: string;
  correo: string;
  cargo: string;
}): string {
  return `
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
                <h1>¡Hemos recibido tu postulación!</h1>
            </div>
            <div class="content">
                <div class="message">
                    <p>Hola <strong>${escapeHtml(data.nombres)} ${escapeHtml(data.apellidos)}</strong>,</p>
                    <p>Agradecemos sinceramente tu interés en unirte al equipo de <strong>Buses Madrid</strong>.</p>
                    <p><strong>Posición solicitada:</strong> ${escapeHtml(data.cargo)}</p>
                    <p>Hemos recibido tu postulación correctamente. Nuestro equipo de Recursos Humanos revisará tu perfil y nos comunicaremos contigo en los próximos días si tu candidatura avanza en el proceso de selección.</p>
                    <p>Agradecemos tu paciencia y dedicación.</p>
                    <p><strong>¡Mucho éxito!</strong></p>
                </div>
            </div>
            <div class="footer">
                <p>Buses Madrid - Sistema de Postulaciones</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Genera HTML para correo administrativo de postulación
 */
export function generateJobApplicationAdminEmailHTML(data: {
  nombres: string;
  apellidos: string;
  rut: string;
  correo: string;
  telefono: string;
  region: string;
  comuna: string;
  licencia: string;
  cargo: string;
  experiencia: string;
  trabajado_antes: string;
  disponibilidad: string;
  experiencia_detalle: string;
  cvFileName?: string;
  cvStoragePath?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #e5e7eb; }
            .section { margin-bottom: 20px; }
            .section-title { background-color: #f3f4f6; padding: 10px; font-weight: bold; color: #1f2937; }
            .field { display: inline-block; width: 48%; margin-right: 4%; }
            .label { font-weight: bold; color: #1f2937; font-size: 12px; }
            .value { color: #4b5563; }
            .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Nueva Postulación Recibida</h1>
            </div>
            <div class="content">
                <div class="section">
                    <div class="section-title">Información Personal</div>
                    <div class="field">
                        <div class="label">Nombre:</div>
                        <div class="value">${escapeHtml(data.nombres)} ${escapeHtml(data.apellidos)}</div>
                    </div>
                    <div class="field">
                        <div class="label">RUT:</div>
                        <div class="value">${escapeHtml(data.rut)}</div>
                    </div>
                    <div style="clear: both;"></div>
                    <div class="field">
                        <div class="label">Correo:</div>
                        <div class="value">${escapeHtml(data.correo)}</div>
                    </div>
                    <div class="field">
                        <div class="label">Teléfono:</div>
                        <div class="value">${escapeHtml(data.telefono)}</div>
                    </div>
                    <div style="clear: both;"></div>
                    <div class="field">
                        <div class="label">Región:</div>
                        <div class="value">${escapeHtml(data.region)}</div>
                    </div>
                    <div class="field">
                        <div class="label">Comuna:</div>
                        <div class="value">${escapeHtml(data.comuna)}</div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Información Profesional</div>
                    <div class="field">
                        <div class="label">Cargo Solicitado:</div>
                        <div class="value">${escapeHtml(data.cargo)}</div>
                    </div>
                    <div class="field">
                        <div class="label">Tipo de Licencia:</div>
                        <div class="value">${escapeHtml(data.licencia)}</div>
                    </div>
                    <div style="clear: both;"></div>
                    <div class="field">
                        <div class="label">Años de Experiencia:</div>
                        <div class="value">${escapeHtml(data.experiencia)}</div>
                    </div>
                    <div class="field">
                        <div class="label">¿Ha trabajado en Buses Madrid?:</div>
                        <div class="value">${escapeHtml(data.trabajado_antes)}</div>
                    </div>
                    <div style="clear: both;"></div>
                    <div class="field">
                        <div class="label">Disponibilidad:</div>
                        <div class="value">${escapeHtml(data.disponibilidad)}</div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Experiencia</div>
                    <div class="value">${escapeHtml(data.experiencia_detalle).replace(/\n/g, "<br>")}</div>
                </div>
                ${
                  data.cvFileName || data.cvStoragePath
                  ? `
                <div class="section">
                  <div class="section-title">Currículum</div>
                  <div class="value"><strong>Archivo:</strong> ${escapeHtml(data.cvFileName || "No disponible")}</div>
                  <div class="value"><strong>Ruta:</strong> ${escapeHtml(data.cvStoragePath || "No disponible")}</div>
                </div>
                `
                  : ""
                }
            </div>
            <div class="footer">
                <p>Postulación enviada desde el sistema de Buses Madrid</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Escapa caracteres HTML para evitar XSS
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
