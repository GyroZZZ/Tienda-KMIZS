import "server-only";

import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";
import { connection } from "next/server";

import { query, queryOne } from "@/lib/db";

/**
 * Cuentas propias de la tienda.
 *
 * - La contraseña se guarda como hash scrypt con sal aleatoria; nunca en claro.
 * - La sesión es una cookie HttpOnly firmada con HMAC-SHA256.
 * - El correo se guarda y se compara siempre en minúsculas.
 *
 * No se usa Supabase Auth: son tres campos (nombre, correo, contraseña) y una
 * cookie, que es todo lo que pide el proyecto.
 */

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keyLength: number,
) => Promise<Buffer>;

const SESSION_COOKIE = "kmizs_sesion";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const KEY_LENGTH = 64;

export interface AccountUser {
  id: string;
  name: string;
  email: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
}

function getSessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Falta AUTH_SECRET (mínimo 32 caracteres) en las variables de entorno.");
  }
  return secret;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const derived = await scrypt(password.normalize("NFKC"), salt, expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export async function createSession(userId: string): Promise<void> {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 }),
  ).toString("base64url");

  const store = await cookies();
  store.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

function readSessionUserId(token: string | undefined): string | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      uid?: unknown;
      exp?: unknown;
    };
    if (typeof parsed.uid !== "string" || typeof parsed.exp !== "number") return null;
    if (parsed.exp < Date.now()) return null;
    return parsed.uid;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AccountUser | null> {
  // La comprobación de caducidad usa Date.now(); esto excluye la función del
  // prerenderizado del shell estático en Next 16 con Cache Components.
  await connection();

  const store = await cookies();
  const userId = readSessionUserId(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  const row = await queryOne<UserRow>(
    "select id, name, email, password_hash from public.users where id = $1",
    [userId],
  );

  return row ? { id: row.id, name: row.name, email: row.email } : null;
}

export interface RegisterResult {
  ok: boolean;
  error?: string;
  user?: AccountUser;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (name.length < 2) {
    return { ok: false, error: "Escribe tu nombre completo." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Escribe un correo válido." };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const existing = await queryOne<{ id: string }>(
    "select id from public.users where email = $1",
    [email],
  );
  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con ese correo. Inicia sesión." };
  }

  const passwordHash = await hashPassword(input.password);
  const rows = await query<{ id: string; name: string; email: string }>(
    `insert into public.users (name, email, password_hash)
     values ($1, $2, $3)
     returning id, name, email`,
    [name, email, passwordHash],
  );

  const user = rows[0];
  if (!user) return { ok: false, error: "No pudimos crear la cuenta. Inténtalo de nuevo." };

  // Los pedidos hechos como invitado con este correo pasan a la cuenta nueva.
  await query("select public.claim_guest_orders($1)", [user.id]);

  return { ok: true, user };
}

export async function authenticate(
  emailInput: string,
  password: string,
): Promise<{ ok: boolean; error?: string; user?: AccountUser }> {
  const email = normalizeEmail(emailInput);
  const row = await queryOne<UserRow>(
    "select id, name, email, password_hash from public.users where email = $1",
    [email],
  );

  // Mismo mensaje para correo inexistente y contraseña equivocada.
  const invalid = { ok: false, error: "Correo o contraseña incorrectos." } as const;
  if (!row) return invalid;

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return invalid;

  await query("select public.claim_guest_orders($1)", [row.id]);

  return { ok: true, user: { id: row.id, name: row.name, email: row.email } };
}
