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
 * Envía un correo electrónico con configuración anti-spam
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const emailFrom = process.env.EMAIL_FROM;
    const fromName = process.env.EMAIL_FROM_NAME || 'Buses Madrid';

    if (!emailFrom) {
      throw new Error("EMAIL_FROM not configured");
    }

    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `"${fromName}" <${emailFrom}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: extractTextFromHtml(options.html), // Versión texto plano (importante para anti-spam)
      replyTo: options.replyTo || emailFrom,
      headers: {
        'X-Mailer': 'Buses Madrid System',
        'X-Priority': '3', // Prioridad normal
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'List-Unsubscribe': `<mailto:${emailFrom}?subject=unsubscribe>`, // Anti-spam
      },
    });

    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Extrae texto plano del HTML (versión simple para emails)
 */
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Confirmación de Postulación - Buses Madrid</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, sans-serif !important;}
        </style>
        <![endif]-->
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            .email-wrapper {
                width: 100%;
                background-color: #f5f5f5;
                padding: 20px 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }
            .logo {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 15px;
                letter-spacing: 2px;
                color: #FFBF00;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                color: #ffffff;
            }
            .content {
                padding: 40px 30px;
                color: #374151;
            }
            .message p {
                margin: 18px 0;
                font-size: 15px;
                line-height: 1.7;
            }
            .highlight {
                background: linear-gradient(135deg, #FFF9E6 0%, #FFEFB3 100%);
                padding: 20px;
                border-left: 5px solid #FFBF00;
                margin: 25px 0;
                border-radius: 6px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .highlight strong {
                color: #1f2937;
                font-size: 16px;
            }
            .footer {
                background-color: #f9fafb;
                padding: 25px 20px;
                text-align: center;
                font-size: 13px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
            }
            .footer a {
                color: #FFBF00;
                text-decoration: none;
                font-weight: 500;
            }
            .footer a:hover {
                text-decoration: underline;
            }
            strong {
                color: #1f2937;
                font-weight: 600;
            }
            .brand-name {
                color: #FFBF00;
                font-weight: 700;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    width: 100% !important;
                    border-radius: 0 !important;
                }
                .content {
                    padding: 30px 20px !important;
                }
                .logo {
                    font-size: 28px !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">🚌 BUSES MADRID</div>
                    <h1>¡Hemos recibido tu postulación!</h1>
                </div>
                <div class="content">
                    <div class="message">
                        <p>Estimado/a <strong>${escapeHtml(data.nombres)} ${escapeHtml(data.apellidos)}</strong>,</p>

                        <p>Agradecemos sinceramente tu interés en formar parte del equipo de <span class="brand-name">Buses Madrid</span>, una empresa líder en transporte de pasajeros con más de 20 años de experiencia.</p>

                        <div class="highlight">
                            <strong>📋 Cargo solicitado:</strong> ${escapeHtml(data.cargo)}
                        </div>

                        <p>Tu postulación ha sido <strong>recibida exitosamente</strong> y se encuentra en proceso de revisión por nuestro equipo de Recursos Humanos.</p>

                        <p>En los próximos días evaluaremos tu perfil profesional y experiencia. Si tu candidatura avanza en el proceso de selección, nos comunicaremos contigo a través de este correo electrónico: <strong>${escapeHtml(data.correo)}</strong></p>

                        <p>Te recomendamos mantener tu bandeja de entrada activa y revisar la carpeta de correo no deseado (spam) regularmente.</p>

                        <p style="margin-top: 30px;"><strong>¡Te deseamos mucho éxito en el proceso de selección!</strong></p>

                        <p style="margin-top: 30px;">
                            Saludos cordiales,<br>
                            <strong>Departamento de Recursos Humanos</strong><br>
                            <span class="brand-name">Buses Madrid</span>
                        </p>
                    </div>
                </div>
                <div class="footer">
                    <p style="margin: 0 0 10px 0;"><strong>BUSES MADRID</strong></p>
                    <p style="margin: 5px 0;">Transporte seguro, confiable y profesional desde 2002</p>
                    <p style="margin: 15px 0 5px 0;">
                        📧 <a href="mailto:contacto@busesmadrid.cl">contacto@busesmadrid.cl</a><br>
                        🌐 <a href="https://www.busesmadrid.cl">www.busesmadrid.cl</a>
                    </p>
                    <p style="margin-top: 20px; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                        Este es un correo automático de confirmación. Por favor, no responder a este mensaje.<br>
                        Para consultas, escríbenos a <a href="mailto:contacto@busesmadrid.cl">contacto@busesmadrid.cl</a>
                    </p>
                </div>
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
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Nueva Postulación - Buses Madrid</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }
            .email-wrapper {
                width: 100%;
                background-color: #f5f5f5;
                padding: 20px 0;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 12px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 26px;
                font-weight: 600;
                color: #FFBF00;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            .alert-new {
                background-color: #FFBF00;
                color: #1f2937;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                display: inline-block;
                margin-top: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .content {
                padding: 30px;
            }
            .candidate-name {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 10px;
                text-align: center;
            }
            .cargo-badge {
                background: linear-gradient(135deg, #FFBF00 0%, #FFD966 100%);
                color: #1f2937;
                padding: 12px 24px;
                border-radius: 8px;
                text-align: center;
                font-size: 18px;
                font-weight: 700;
                margin: 20px auto;
                max-width: 400px;
                box-shadow: 0 2px 8px rgba(255,191,0,0.3);
            }
            .section {
                margin: 25px 0;
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 20px;
                border-left: 4px solid #FFBF00;
            }
            .section-title {
                background-color: #1f2937;
                color: #FFBF00;
                padding: 12px 16px;
                font-weight: 700;
                font-size: 16px;
                border-radius: 6px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .field-row {
                display: table;
                width: 100%;
                margin-bottom: 12px;
            }
            .field {
                display: table-cell;
                width: 50%;
                padding-right: 20px;
                vertical-align: top;
            }
            .label {
                font-weight: 700;
                color: #1f2937;
                font-size: 13px;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .value {
                color: #4b5563;
                font-size: 15px;
                padding: 8px 0;
            }
            .cv-section {
                background: linear-gradient(135deg, #FFF9E6 0%, #FFEFB3 100%);
                border: 2px solid #FFBF00;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin: 25px 0;
            }
            .cv-button {
                display: inline-block;
                background: linear-gradient(135deg, #FFBF00 0%, #FFD966 100%);
                color: #1f2937;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 700;
                font-size: 16px;
                margin-top: 15px;
                box-shadow: 0 4px 12px rgba(255,191,0,0.4);
                transition: transform 0.2s;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .cv-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(255,191,0,0.5);
            }
            .experience-box {
                background-color: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 15px;
                color: #374151;
                line-height: 1.8;
                white-space: pre-wrap;
            }
            .footer {
                background-color: #1f2937;
                color: #9ca3af;
                padding: 20px;
                text-align: center;
                font-size: 12px;
            }
            .footer strong {
                color: #FFBF00;
            }
            @media only screen and (max-width: 600px) {
                .container { width: 100% !important; border-radius: 0 !important; }
                .field { display: block !important; width: 100% !important; }
                .content { padding: 20px !important; }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <div class="header">
                    <h1>🚌 NUEVA POSTULACIÓN RECIBIDA</h1>
                    <div class="alert-new">⚡ Acción Requerida</div>
                </div>
                <div class="content">
                    <div class="candidate-name">
                        ${escapeHtml(data.nombres)} ${escapeHtml(data.apellidos)}
                    </div>
                    <div class="cargo-badge">
                        📋 ${escapeHtml(data.cargo)}
                    </div>

                    <div class="section">
                        <div class="section-title">👤 Información Personal</div>
                        <div class="field-row">
                            <div class="field">
                                <div class="label">Nombre Completo:</div>
                                <div class="value">${escapeHtml(data.nombres)} ${escapeHtml(data.apellidos)}</div>
                            </div>
                            <div class="field">
                                <div class="label">RUT:</div>
                                <div class="value">${escapeHtml(data.rut)}</div>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <div class="label">📧 Correo Electrónico:</div>
                                <div class="value"><a href="mailto:${escapeHtml(data.correo)}" style="color: #FFBF00; text-decoration: none; font-weight: 600;">${escapeHtml(data.correo)}</a></div>
                            </div>
                            <div class="field">
                                <div class="label">📱 Teléfono:</div>
                                <div class="value"><a href="tel:${escapeHtml(data.telefono)}" style="color: #FFBF00; text-decoration: none; font-weight: 600;">${escapeHtml(data.telefono)}</a></div>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <div class="label">📍 Región:</div>
                                <div class="value">${escapeHtml(data.region)}</div>
                            </div>
                            <div class="field">
                                <div class="label">🏘️ Comuna:</div>
                                <div class="value">${escapeHtml(data.comuna)}</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">💼 Información Profesional</div>
                        <div class="field-row">
                            <div class="field">
                                <div class="label">🎯 Cargo Solicitado:</div>
                                <div class="value" style="font-weight: 700; color: #1f2937; font-size: 16px;">${escapeHtml(data.cargo)}</div>
                            </div>
                            <div class="field">
                                <div class="label">🪪 Tipo de Licencia:</div>
                                <div class="value">${escapeHtml(data.licencia)}</div>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <div class="label">📈 Años de Experiencia:</div>
                                <div class="value">${escapeHtml(data.experiencia)}</div>
                            </div>
                            <div class="field">
                                <div class="label">🔄 ¿Ha trabajado en Buses Madrid?</div>
                                <div class="value">${escapeHtml(data.trabajado_antes)}</div>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <div class="label">⏰ Disponibilidad:</div>
                                <div class="value">${escapeHtml(data.disponibilidad)}</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">📝 Experiencia Laboral</div>
                        <div class="experience-box">${escapeHtml(data.experiencia_detalle)}</div>
                    </div>

                    ${data.cvStoragePath ? `
                    <div class="cv-section">
                        <div style="font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 10px;">
                            📄 Currículum Vitae
                        </div>
                        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                            <strong>Archivo:</strong> ${escapeHtml(data.cvFileName || 'curriculum.pdf')}
                        </div>
                        <a href="${escapeHtml(data.cvStoragePath)}" class="cv-button" target="_blank" rel="noopener">
                            📥 Descargar CV
                        </a>
                        <div style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
                            Haz clic en el botón para descargar y revisar el currículum del candidato
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="footer">
                    <p style="margin: 5px 0;"><strong>Sistema de Gestión de Postulaciones</strong></p>
                    <p style="margin: 5px 0;">BUSES MADRID - Recursos Humanos</p>
                    <p style="margin: 15px 0 5px 0; font-size: 11px;">
                        Este correo fue generado automáticamente por el sistema de postulaciones de<br>
                        <strong>www.busesmadrid.cl</strong>
                    </p>
                </div>
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
