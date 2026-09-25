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

interface ComplaintData {
  tipo: string;
  descripcion: string;
  lugar?: string;
  es_anonima?: number;
  nombre?: string;
  correo?: string;
  celular?: string;
  rut?: string;
  tipoEnvio?: string;
  ip_origen?: string;
  archivo_url?: string;
  archivo_nombre?: string;
  archivo_mime?: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface AdminUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export type AdminLoginResult =
  | { ok: true; user: AdminUser }
  | { ok: false; status: number; error: string };

export type ProxyResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export interface AdminDashboardData {
  stats: {
    total: number;
    en_revision: number;
    cerradas: number;
    criticas: number;
  };
  recientes: Array<{
    codigo: string;
    tipo: string;
    estado: string;
    prioridad: string;
    creado_en: string;
  }>;
  actividad: Array<{
    accion: string;
    entidad: string | null;
    entidad_id: number | null;
    creado_en: string;
    usuario_nombre: string | null;
  }>;
}

export interface AdminComplaintDetail {
  item: Record<string, unknown>;
  archivos: Array<Record<string, unknown>>;
  seguimiento: Array<Record<string, unknown>>;
}

export interface AdminFollowupData {
  denunciaId: number;
  usuarioId: number;
  estado: string;
  nota: string;
  prioridad?: string;
  esVisibleDenunciante?: boolean;
  ipOrigen?: string;
  userAgent?: string;
}

export interface AdminUserRow {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  ultimo_acceso: string | null;
  creado_en: string;
}

export interface AdminUserInput {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: string;
  estado?: string;
}

class DbProxyClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.DB_PROXY_URL || 'https://busesmadrid.cl/db-proxy.php';
    this.apiKey = process.env.DB_PROXY_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('DB_PROXY_API_KEY not configured in Vercel environment');
    }
  }

  private async request<T>(action: string, data: object): Promise<T> {
    try {
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

      return result.data as T;
    } catch (error) {
      console.error(`DB Proxy error (${action}):`, error);
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
   * Insertar denuncia ética
   */
  async insertComplaint(data: ComplaintData): Promise<{ denunciaId: number; codigo: string }> {
    return this.request<{ denunciaId: number; codigo: string }>('insert_complaint', data);
  }

  /**
   * Login de administrador vía proxy PHP (el hash bcrypt se verifica en el servidor)
   */
  async adminLogin(email: string, password: string): Promise<AdminLoginResult> {
    const result = await this.requestResult<AdminUser>('admin_login', { email, password });

    if (!result.ok) {
      return result;
    }

    return { ok: true, user: result.data };
  }

  private async requestResult<T>(action: string, data: object): Promise<ProxyResult<T>> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({ action, ...data }),
      });

      const result = (await response.json().catch(() => ({}))) as ProxyResponse<T>;

      if (!response.ok || !result.success || result.data === undefined) {
        return {
          ok: false,
          status: response.status,
          error: result.error || 'proxy_error',
        };
      }

      return { ok: true, data: result.data };
    } catch (error) {
      console.error(`DB Proxy error (${action}):`, error);
      return { ok: false, status: 500, error: 'proxy_unreachable' };
    }
  }

  async adminDashboard(): Promise<ProxyResult<AdminDashboardData>> {
    return this.requestResult<AdminDashboardData>('admin_dashboard', {});
  }

  async adminListComplaints(): Promise<ProxyResult<Array<Record<string, unknown>>>> {
    return this.requestResult<Array<Record<string, unknown>>>('admin_list_complaints', {});
  }

  async adminGetComplaint(id: number): Promise<ProxyResult<AdminComplaintDetail>> {
    return this.requestResult<AdminComplaintDetail>('admin_get_complaint', { id });
  }

  async adminAddFollowup(data: AdminFollowupData): Promise<ProxyResult<{ success: boolean }>> {
    return this.requestResult<{ success: boolean }>('admin_add_followup', {
      denuncia_id: data.denunciaId,
      usuario_id: data.usuarioId,
      estado: data.estado,
      nota: data.nota,
      prioridad: data.prioridad ?? 'media',
      es_visible_denunciante: data.esVisibleDenunciante ? 1 : 0,
      ip_origen: data.ipOrigen,
      user_agent: data.userAgent,
    });
  }

  async adminGetCv(
    id: number
  ): Promise<ProxyResult<{ nombre_original: string; ruta: string; mime_type: string }>> {
    return this.requestResult<{ nombre_original: string; ruta: string; mime_type: string }>(
      'admin_get_cv',
      { id }
    );
  }

  async adminListUsers(): Promise<ProxyResult<AdminUserRow[]>> {
    return this.requestResult<AdminUserRow[]>('admin_list_users', {});
  }

  async adminCreateUser(data: AdminUserInput & { nombre: string; email: string; password: string }): Promise<
    ProxyResult<{ id: number }>
  > {
    return this.requestResult<{ id: number }>('admin_create_user', data);
  }

  async adminUpdateUser(id: number, data: AdminUserInput): Promise<ProxyResult<{ updated: boolean }>> {
    return this.requestResult<{ updated: boolean }>('admin_update_user', { id, ...data });
  }

  /**
   * Enviar email a través del proxy
   */
  async sendEmail(data: EmailData): Promise<{ sent: boolean }> {
    // Usar base64 + URL encode para evitar ModSecurity
    const htmlBase64 = Buffer.from(data.html).toString('base64');
    const encodedData = {
      to: data.to,
      subject: data.subject,
      htmlBase64: htmlBase64,
      replyTo: data.replyTo,
    };
    return this.request<{ sent: boolean }>('send_email', encodedData as unknown as EmailData);
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

export type { JobApplicationData, ContactData, ComplaintData, EmailData };
