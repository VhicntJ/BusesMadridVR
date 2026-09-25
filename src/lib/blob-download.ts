// src/lib/blob-download.ts
import { issueSignedToken, presignUrl } from "@vercel/blob";

const DEFAULT_TTL_MS = 15 * 60 * 1000;

export async function getPrivateBlobUrl(
  blobUrl: string,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<string> {
  const pathname = new URL(blobUrl).pathname.replace(/^\//, "");
  const validUntil = Date.now() + ttlMs;

  const token = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil,
  });

  const { presignedUrl } = await presignUrl(token, {
    operation: "get",
    pathname,
    access: "private",
    validUntil,
  });

  return presignedUrl;
}
