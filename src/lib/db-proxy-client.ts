// src/lib/db-proxy-client.ts

/**
 * Cliente para el proxy de base de datos PHP
 * Permite ejecutar operaciones de base de datos a través de un endpoint seguro
 */

interface ProxyResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface JobApplicationData {
  nombres: string;
  apellidos: string;
  rut: string;
  correo: string;
  telefono: string;
  region: string;
  comuna: string;
  cargo: string;
  experiencia: string;
  licencia: string | null;
  disponibilidad: string;
  experiencia_detalle: string;
  notas_internas?: string;
  ip_origen?: string;
  cv_url?: string;
  cv_original_name?: string;
  cv_stored_name?: string;
  cv_mime_type?: string;
  cv_size?: number;
}

interface ContactData {
  nombre: string;
  correo: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  ip_origen?: string;
}

class DbProxyClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.DB_PROXY_URL || 'https://busesmadrid.cl/db-proxy.php';
    this.apiKey = process.env.DB_PROXY_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('DB_PROXY_API_KEY not configured');
    }
  }

  private async request<T>(action: string, data: JobApplicationData | ContactData): Promise<T> {
    try {
      console.log(`🔄 DB Proxy request: ${action}`);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          action,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result: ProxyResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.message || 'Unknown error from proxy');
      }

      console.log(`✅ DB Proxy success: ${action}`);
      return result.data as T;
    } catch (error) {
      console.error(`❌ DB Proxy error (${action}):`, error);
      throw error;
    }
  }

  /**
   * Insertar postulación de trabajo
   */
  async insertJobApplication(data: JobApplicationData): Promise<{ postulacionId: number }> {
    return this.request<{ postulacionId: number }>('insert_job_application', data);
  }

  /**
   * Insertar mensaje de contacto
   */
  async insertContact(data: ContactData): Promise<{ contactId: number }> {
    return this.request<{ contactId: number }>('insert_contact', data);
  }

  /**
   * Enviar email a través del proxy
   */
  async sendEmail(data: { to: string; subject: string; html: string; replyTo?: string }): Promise<{ sent: boolean }> {
    return this.request<{ sent: boolean }>('send_email', data as unknown as JobApplicationData | ContactData);
  }
}

// Singleton para reutilizar la instancia
let dbProxyClient: DbProxyClient | null = null;

export function getDbProxyClient(): DbProxyClient {
  if (!dbProxyClient) {
    dbProxyClient = new DbProxyClient();
  }
  return dbProxyClient;
}

export type { JobApplicationData, ContactData };
