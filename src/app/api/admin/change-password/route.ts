import { NextResponse } from "next/server";
import { getDbProxyClient } from "@/lib/db-proxy-client";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body ?? {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      currentPassword === "" ||
      newPassword.length < 8
    ) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña debe ser diferente a la actual" },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    const result = await getDbProxyClient().adminChangePassword(
      session.userId,
      currentPassword,
      newPassword,
      { ipOrigen: ipAddress, userAgent: request.headers.get("user-agent") || undefined }
    );

    if (!result.ok) {
      if (result.error === "invalid_current_password") {
        return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 401 });
      }
      if (result.status === 400) {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
      }
      console.error("Error changing password:", result.status, result.error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
