import "server-only";

import { Pool, type PoolClient, type QueryResultRow } from "pg";

/**
 * Conexión a Postgres (Supabase).
 *
 * Todo el acceso a datos del sitio pasa por aquí y ocurre solo en el servidor:
 * componentes de servidor, server actions y route handlers. El navegador nunca
 * recibe la cadena de conexión ni puede leer pedidos o cupones directamente.
 *
 * En producción se usa el pooler de Supabase, que ya multiplexa conexiones; por
 * eso el pool local se mantiene pequeño y se reutiliza entre invocaciones.
 */

declare global {
  var __kmizsPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL. Copia la cadena de conexión del proyecto de Supabase en .env.local.",
    );
  }

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
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
  const result = await getPool().query<T>(sql, params);
  return result.rows;
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
  const client = await getPool().connect();
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
