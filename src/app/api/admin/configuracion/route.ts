import { NextResponse } from "next/server";
import { getDbProxyClient, type ConfigItem } from "@/lib/db-proxy-client";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await getDbProxyClient().adminGetConfig();

  if (!result.ok) {
    console.error("Error fetching config:", result.status, result.error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }

  return NextResponse.json({ items: result.data });
}

export async function PUT(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const clean: ConfigItem[] = items
      .filter(
        (item: unknown): item is ConfigItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as ConfigItem).clave === "string" &&
          (item as ConfigItem).clave.trim() !== ""
      )
      .map((item: ConfigItem) => ({
        clave: item.clave.trim(),
        valor: String(item.valor ?? ""),
      }));

    if (clean.length === 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const result = await getDbProxyClient().adminUpdateConfig(clean);

    if (!result.ok) {
      if (result.status === 400) {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
      }
      console.error("Error updating config:", result.status, result.error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
