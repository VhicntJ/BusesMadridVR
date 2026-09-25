import { NextResponse } from "next/server";
import { getDbProxyClient } from "@/lib/db-proxy-client";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await getDbProxyClient().adminListUsers();

  if (!result.ok) {
    console.error("Error fetching users:", result.status, result.error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }

  return NextResponse.json({ items: result.data });
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { nombre, email, password, rol, estado } = body ?? {};

    if (
      typeof nombre !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !nombre.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña (mínimo 8 caracteres) son obligatorios" },
        { status: 400 }
      );
    }

    const result = await getDbProxyClient().adminCreateUser({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      rol: typeof rol === "string" ? rol : "observador",
      estado: typeof estado === "string" ? estado : "activo",
    });

    if (!result.ok) {
      if (result.error === "email_exists") {
        return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
      }
      if (result.status === 400) {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
      }
      console.error("Error creating user:", result.status, result.error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.data.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
