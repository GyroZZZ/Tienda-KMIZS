import "server-only";

import { Pool, type PoolClient, type QueryResultRow } from "pg";

/**
 * Conexión a Postgres (Supabase).
 *
 * Todo el acceso a datos del sitio pasa por aquí y ocurre solo en el servidor:
 * componentes de servidor, server actions y route handlers. El navegador nunca
 * recibe la cadena de conexión ni puede leer pedidos o cupones directamente.
 *
 * En producción se usa el pooler de Supabase en **modo transacción** (puerto
 * 6543): reparte cada consulta entre un número pequeño de conexiones reales y
 * admite muchas más instancias que el modo sesión, que se corta en 15. El pool
 * local se mantiene mínimo y se reutiliza entre invocaciones.
 */

declare global {
  var __kmizsPool: Pool | undefined;
}

/**
 * Fallos que ocurren al **conseguir** la conexión, no al ejecutar la consulta.
 * Solo esos se reintentan: repetir una consulta que ya llegó a la base podría
 * duplicar una escritura. Los tiempos de espera quedan fuera para no duplicar
 * la latencia que ya consumió el primer intento.
 */
const CONNECT_FAILURE =
  /max clients reached|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|getaddrinfo/i;

function isConnectFailure(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && CONNECT_FAILURE.test(message);
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL. Copia la cadena de conexión del proyecto de Supabase en .env.local.",
    );
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    // Deja que la instancia termine cuando no hay trabajo pendiente.
    allowExitOnIdle: true,
  });

  // Sin este manejador, un cliente que el servidor cierra en reposo emite un
  // error sin escuchar y tumba la invocación completa.
  pool.on("error", (error) => {
    console.error("[db] el servidor cerró una conexión inactiva:", error.message);
  });

  return pool;
}

async function withConnectRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!isConnectFailure(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 150));
    return run();
  }
}

export function getPool(): Pool {
  if (!globalThis.__kmizsPool) {
    globalThis.__kmizsPool = createPool();
  }
  return globalThis.__kmizsPool;
}

export async function query<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  return withConnectRetry(async () => {
    const result = await getPool().query<T>(sql, params);
    return result.rows;
  });
}

export async function queryOne<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Transacción explícita para operaciones de varios pasos. */
export async function withTransaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await withConnectRetry(() => getPool().connect());
  try {
    await client.query("begin");
    const result = await run(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Código de error de negocio lanzado por las funciones SQL (`CUPON_INVALIDO`, …). */
export function readDatabaseErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const message = (error as { message?: unknown }).message;
  if (typeof message !== "string") return null;
  const match = /^([A-Z_]+)(?::(.*))?$/.exec(message.trim());
  return match ? match[1] : null;
}

export function readDatabaseErrorDetail(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const message = (error as { message?: unknown }).message;
  if (typeof message !== "string") return null;
  const match = /^[A-Z_]+:(.*)$/.exec(message.trim());
  return match ? match[1] : null;
}
