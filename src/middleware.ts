import { unsealData } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';

interface SessionData {
  usuarioId?: string;
  role?: string;
}

const COOKIE_NAME = 'agendamentos_session';
const PUBLIC_PATHS = ['/login'];

async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionData | null> {
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookieValue) return null;

  try {
    return await unsealData<SessionData>(cookieValue, {
      password: process.env.SESSION_SECRET!,
    });
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const session = await getSessionFromRequest(request);
  const isAuthenticated = !!session?.usuarioId;

  // Não autenticado → redireciona para /login
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Autenticado tentando acessar /login → redireciona para /
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.svg|.*\\.ico).*)',
  ],
};
