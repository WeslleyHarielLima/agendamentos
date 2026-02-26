'use server';

import { prisma } from '@/lib/prisma';

export async function listarProcedimentos() {
  const procedimentos = await prisma.procedimento.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
  });

  return procedimentos.map((p) => ({
    ...p,
    valor: Number(p.valor),
  }));
}
