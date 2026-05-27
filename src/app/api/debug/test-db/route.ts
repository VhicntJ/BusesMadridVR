// src/app/api/debug/test-db/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = "nodejs";

export async function GET() {
  const results = [];

  // Obtener credenciales de .env
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbPort = parseInt(process.env.DB_PORT || "3306", 10);

  if (!dbName || !dbUser || !dbPassword) {
    return NextResponse.json({
      error: "Missing DB credentials in environment variables",
    });
  }

  // Diferentes hosts para probar
  const hostsToTry = [
    process.env.DB_HOST, // El que está configurado
    "busesmadrid.cl",
    "mysql.busesmadrid.cl",
    "localhost", // No funcionará, pero lo incluimos para comparar
  ];

  for (const host of hostsToTry) {
    if (!host) continue;

    try {
      const connection = await mysql.createConnection({
        host,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        connectTimeout: 5000, // 5 segundos timeout
      });

      // Si llegamos aquí, la conexión funcionó
      await connection.end();

      results.push({
        host,
        status: "✅ SUCCESS",
        message: "Connection successful",
      });
    } catch (error: any) {
      results.push({
        host,
        status: "❌ FAILED",
        message: error.message || "Unknown error",
        code: error.code,
      });
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    dbName,
    dbUser,
    dbPort,
    results,
  });
}
