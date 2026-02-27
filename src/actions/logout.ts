'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function logout(): Promise<void> {
  const session = await getSession();
  if (session.usuarioId) {
    await prisma.session.deleteMany({
      where: { usuarioId: session.usuarioId },
    });
  }
  session.destroy();
  redirect('/login');
}
