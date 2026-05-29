import mysql, { type Pool, type ResultSetHeader } from "mysql2/promise";

let pool: Pool | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getDbPool(): Pool {
  if (pool) {
    return pool;
  }

  const host = getRequiredEnv("DB_HOST");
  const port = parseInt(getRequiredEnv("DB_PORT"), 10);
  const database = getRequiredEnv("DB_NAME");
  const user = getRequiredEnv("DB_USER");
  const password = getRequiredEnv("DB_PASSWORD");

  console.log(`🔌 Creating database pool: ${user}@${host}:${port}/${database}`);

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "Z",
    charset: "utf8mb4",
    connectTimeout: 30000, // 30 seconds para conexiones remotas
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  return pool;
}

export type { ResultSetHeader };
