import { NextRequest, NextResponse } from "next/server";
import { getDbProxyClient, type AdminUserInput } from "@/lib/db-proxy-client";
import { requireAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, password, rol, estado } = body ?? {};

    // Evitar que un admin se desactive o se quite su propio rol
    if (userId === auth.session.userId) {
      if (typeof estado === "string" && estado !== "activo") {
        return NextResponse.json(
          { error: "No puedes desactivar tu propia cuenta" },
          { status: 400 }
        );
      }
      if (typeof rol === "string" && rol !== "administrador") {
        return NextResponse.json(
          { error: "No puedes quitarte tu propio rol de administrador" },
          { status: 400 }
        );
      }
    }

    const update: AdminUserInput = {};
    if (typeof nombre === "string" && nombre.trim()) update.nombre = nombre.trim();
    if (typeof rol === "string") update.rol = rol;
    if (typeof estado === "string") update.estado = estado;
    if (typeof password === "string" && password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 8 caracteres" },
          { status: 400 }
        );
      }
      update.password = password;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const result = await getDbProxyClient().adminUpdateUser(userId, update);

    if (!result.ok) {
      if (result.status === 400) {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
      }
      console.error("Error updating user:", result.status, result.error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
