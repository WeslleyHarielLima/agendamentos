'use server';

import { prisma } from '@/lib/prisma';

export async function listarCompromissos() {
  return prisma.compromisso.findMany({
    orderBy: { dataMarcacao: 'asc' },
  });
}
