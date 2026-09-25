import { cookies } from "next/headers";
import { verifyToken, type AdminSession } from "@/lib/auth";

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("bm_admin_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdminSession(): Promise<
  { ok: true; session: AdminSession } | { ok: false; status: number; error: string }
> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  if (session.rol !== "administrador") {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  return { ok: true, session };
}
