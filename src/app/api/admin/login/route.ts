import { NextResponse } from "next/server";
import { getDbProxyClient } from "@/lib/db-proxy-client";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const result = await getDbProxyClient().adminLogin(email.trim().toLowerCase(), password);

    if (!result.ok) {
      if (result.error === "invalid_credentials") {
        return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
      }
      if (result.error === "inactive_account") {
        return NextResponse.json({ error: "Cuenta inactiva o suspendida" }, { status: 403 });
      }
      if (result.error === "missing_credentials") {
        return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
      }
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }

    const token = await signToken({
      userId: result.user.id,
      nombre: result.user.nombre,
      email: result.user.email,
      rol: result.user.rol,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
