import { NextResponse, type NextRequest } from "next/server";

/**
 * Las páginas de cuenta leen la cookie de sesión, así que la redirección se
 * resuelve aquí antes de renderizar: sin sesión no tiene sentido construir la
 * página para después descartarla.
 *
 * Solo se comprueba que la cookie exista. La firma y la vigencia se validan en
 * `lib/auth.ts`; si la cookie existe pero ya no sirve, la página vuelve a
 * redirigir a `/cuenta/ingresar`.
 */
const SESSION_COOKIE = "kmizs_sesion";

const PUBLIC_ACCOUNT_PATHS = new Set(["/cuenta/ingresar", "/cuenta/registro"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ACCOUNT_PATHS.has(pathname) || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/cuenta/ingresar";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/cuenta/:path*"],
};
