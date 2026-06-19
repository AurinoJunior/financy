import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

const authRoutes = ["/login", "/register"]

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl
  const isAuthRoute = authRoutes.includes(pathname)

  // Sem sessão tentando acessar área logada → manda pro login.
  if (!sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Já logado tentando acessar login/registro → manda pra dashboard.
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
