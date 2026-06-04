// src/app/api/test-proxy/route.ts

/**
 * Endpoint temporal para probar el proxy desde el servidor de Vercel
 * DELETE ESTO DESPUÉS DE PROBAR
 */

import { getDbProxyClient } from '@/lib/db-proxy-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'test@example.com';

    console.log('🧪 Testing proxy from Vercel server...');
    console.log('📧 Test email:', email);

    const dbProxy = getDbProxyClient();

    // HTML simple de prueba
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
          h1 { color: #1f2937; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🧪 Test Email from Vercel</h1>
          <p>This is a test email sent from Vercel server to test the proxy.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const result = await dbProxy.sendEmail({
      to: email,
      subject: '🧪 Test from Vercel - Buses Madrid',
      html: testHtml,
    });

    return Response.json(
      {
        success: true,
        message: 'Email sent successfully from Vercel',
        result,
        testInfo: {
          sentTo: email,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Proxy test failed:', error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}
