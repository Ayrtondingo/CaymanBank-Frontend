import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// El frontend ya no tiene route handlers propios: todo lo que necesita
// credenciales pasa por el backend. Por eso `/api` dejo de ser publico.
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;

  // `auth.protect()` responde 404 al usuario deslogueado, que en un homebanking
  // se lee como "la página no existe". Redirigir al login es lo esperable, y
  // `returnBackUrl` lo devuelve a donde quería entrar.
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: urlPublica(request) });
  }
});

/**
 * Detras de un proxy (Caddy en el droplet), `request.url` trae la direccion
 * interna del contenedor (http://0.0.0.0:3000/...): despues del login el
 * navegador volveria a una URL que no puede abrir. Se reconstruye con los
 * encabezados que manda el proxy; sin proxy (local, Vercel) da lo mismo.
 */
function urlPublica(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.url;

  const protocolo =
    request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ??
    request.nextUrl.protocol.replace(":", "");

  return `${protocolo}://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|ttf|woff2?|map|txt)).*)",
  ],
};
