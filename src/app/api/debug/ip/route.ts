// src/app/api/debug/ip/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Obtener IP saliente de Vercel
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    return NextResponse.json({
      outgoingIP: data.ip,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get IP" },
      { status: 500 }
    );
  }
}
