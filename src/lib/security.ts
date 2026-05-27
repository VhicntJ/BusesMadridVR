// src/lib/security.ts
import { RateLimiterMemory, type RateLimiterRes } from "rate-limiter-flexible";

/**
 * Rate limiter en memoria (se reinicia con cada deploy, ideal para desarrollo)
 * Para producción con múltiples servidores, usar Redis
 */
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_REQUESTS || "5", 10), // máximo de solicitudes
  duration: parseInt(process.env.RATE_LIMIT_WINDOW || "900", 10), // ventana en segundos (15 minutos)
});

/**
 * Obtiene la IP del cliente desde diferentes headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Valida que el origen sea permitido
 */
export function isOriginAllowed(request: Request): boolean {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  // En desarrollo, permitir localhost
  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push("http://localhost:3000");
    allowedOrigins.push("http://localhost:3001");
    allowedOrigins.push("http://localhost:3002");
    allowedOrigins.push("http://localhost:3003");
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return process.env.NODE_ENV !== "production";
  }

  if (allowedOrigins.length === 0) {
    return process.env.NODE_ENV !== "production";
  }

  if (allowedOrigins.includes("*")) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/$/, "");
  return allowedOrigins.some((allowed) => normalizedOrigin === allowed.replace(/\/$/, ""));
}

/**
 * Aplica rate limiting basado en IP
 */
export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; error?: string }> {
  try {
    await rateLimiter.consume(ip);
    return { allowed: true };
  } catch (rateLimiterRes) {
    const limiterRes = rateLimiterRes as RateLimiterRes;
    const retryAfter = Math.round(((limiterRes?.msBeforeNext ?? 0) / 1000) || 0);
    return {
      allowed: false,
      error: `Too many requests. Try again in ${retryAfter} seconds`,
    };
  }
}

/**
 * Valida que el Content-Type sea JSON
 */
export function isValidContentType(request: Request, allowedContentTypes: string[] = ["application/json"]): boolean {
  const contentType = request.headers.get("content-type") || "";
  return allowedContentTypes.some((allowed) => contentType.startsWith(allowed));
}

/**
 * Genera respuesta de error JSON con status HTTP
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: unknown
): Response {
  return Response.json(
    {
      success: false,
      error: message,
      ...(details !== undefined ? { details } : {}),
    },
    { status }
  );
}

/**
 * Genera respuesta de éxito JSON
 */
export function successResponse(data?: unknown, message: string = "Success"): Response {
  return Response.json(
    {
      success: true,
      message,
      ...(data !== undefined && { data }),
    },
    { status: 200 }
  );
}

/**
 * Middleware de seguridad completo
 */
export async function validateRequest(
  request: Request,
  options?: { allowedContentTypes?: string[] }
): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Verificar método HTTP
  if (request.method !== "POST") {
    return { valid: false, error: "Method not allowed" };
  }

  // Verificar origen
  if (!isOriginAllowed(request)) {
    return { valid: false, error: "Origin not allowed" };
  }

  // Verificar Content-Type
  const allowedContentTypes = options?.allowedContentTypes ?? ["application/json"];
  if (!isValidContentType(request, allowedContentTypes)) {
    return { valid: false, error: "Invalid content type" };
  }

  // Aplicar rate limiting
  const clientIp = getClientIp(request);
  const rateLimitCheck = await checkRateLimit(clientIp);

  if (!rateLimitCheck.allowed) {
    return { valid: false, error: rateLimitCheck.error };
  }

  return { valid: true };
}
