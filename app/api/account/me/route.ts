import { getCurrentUser } from "@/lib/auth";

/** Sesión actual para el panel lateral de cuenta, sin hacer dinámico el layout. */
export async function GET() {
  const user = await getCurrentUser();
  return Response.json(
    { user },
    { headers: { "Cache-Control": "no-store" } },
  );
}
