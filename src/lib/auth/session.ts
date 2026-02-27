import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  usuarioId: string;
  role: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'agendamentos_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8, // 8 horas
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
