// src/lib/cloudinary-signed-url.ts
import crypto from 'crypto';

/**
 * Genera una URL firmada de Cloudinary que expira en 24 horas
 * Esto permite servir videos privados sin hacerlos públicos
 */
export function getCloudinarySignedUrl(publicId: string): string {
  const cloudName = 'dcwrs26wf';
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET not configured');
  }

  // Timestamp de expiración (24 horas desde ahora)
  const timestamp = Math.floor(Date.now() / 1000) + 86400;

  // Crear firma
  const stringToSign = `timestamp=${timestamp}&${publicId}${apiSecret}`;
  const signature = crypto
    .createHash('sha256')
    .update(stringToSign)
    .digest('hex');

  // Construir URL firmada
  const signedUrl = `https://res.cloudinary.com/${cloudName}/video/upload/s--${signature}--/t_${timestamp}/${publicId}.mp4`;

  return signedUrl;
}
