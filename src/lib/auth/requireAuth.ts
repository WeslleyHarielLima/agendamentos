import { redirect } from 'next/navigation';
import { getSession } from './session';
import type { SessionData } from './session';

export async function requireAuth(): Promise<
  SessionData & { usuarioId: string }
> {
  const session = await getSession();
  if (!session.usuarioId) {
    redirect('/login');
  }
  return session as SessionData & { usuarioId: string };
}
