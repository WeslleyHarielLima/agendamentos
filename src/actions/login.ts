'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { verificarSenha } from '@/lib/auth/password';
import { loginSchema } from '@/lib/schemas/auth-schema';
import { checkLoginRateLimit } from '@/lib/rateLimit';

export async function login(
  formData: unknown
): Promise<{ error: string } | void> {
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for') ??
    headersList.get('x-real-ip') ??
    'unknown';
  try {
    await checkLoginRateLimit(ip);
  } catch {
    return { error: 'Muitas tentativas. Tente novamente em 15 minutos.' };
  }

  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: 'Dados inválidos' };
  }

  const { email, senha } = parsed.data;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    return { error: 'Credenciais inválidas' };
  }

  if (!usuario.ativo) {
    return { error: 'Conta desativada' };
  }

  if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
    return {
      error:
        'Conta bloqueada temporariamente. Tente novamente em alguns minutos.',
    };
  }

  const valido = await verificarSenha(senha, usuario.senhaHash);
  if (!valido) {
    const tentativas = usuario.tentativas + 1;
    const bloqueadoAte =
      tentativas >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tentativas, bloqueadoAte },
    });
    return { error: 'Credenciais inválidas' };
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { tentativas: 0, bloqueadoAte: null },
  });

  const session = await getSession();
  session.usuarioId = usuario.id;
  session.role = usuario.role;
  await session.save();

  redirect('/');
}
