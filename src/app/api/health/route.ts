// src/app/api/health/route.ts

/**
 * Health check endpoint
 * Usado por scripts de testing para verificar que el servidor está corriendo
 */
export async function GET() {
  return Response.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
