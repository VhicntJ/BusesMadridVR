import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

type DbUser = {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: string;
  estado: string;
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const pool = getDbPool();
    const [rows] = await pool.execute(
      "SELECT id, nombre, email, password_hash, rol, estado FROM bm_usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    const users = rows as DbUser[];
    if (users.length === 0) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const user = users[0];

    if (user.estado !== "activo") {
      return NextResponse.json({ error: "Cuenta inactiva o suspendida" }, { status: 403 });
    }

    const passwordValid = await compare(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    await pool.execute("UPDATE bm_usuarios SET ultimo_acceso = NOW() WHERE id = ?", [user.id]);

    const token = await signToken({
      userId: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
