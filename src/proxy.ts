import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

const authRoutes = ["/login", "/register"]

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl
  const isAuthRoute = authRoutes.includes(pathname)

  if (!sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
