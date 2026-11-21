import { connection } from "next/server";

import { readCurrentUser } from "@/lib/auth";

/**
 * Sesión actual para el panel lateral de cuenta, sin hacer dinámico el layout.
 *
 * Distingue "no hay sesión" de "no se pudo consultar": si la base no responde,
 * el panel muestra un aviso con reintento en vez de fingir que el usuario salió.
 */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };

  // Fuera del try: durante el prerenderizado esta llamada es la señal para
  // detenerse. Capturarla dejaría la ruta servida como estática.
  await connection();

  try {
    const user = await readCurrentUser();
    return Response.json({ user }, { headers });
  } catch (error) {
    console.error("[cuenta] no se pudo leer la sesión:", error);
    return Response.json({ user: null, unavailable: true }, { status: 503, headers });
  }
}
