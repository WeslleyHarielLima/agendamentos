'use server';

import { prisma } from '@/lib/prisma';

export async function listarCompromissos() {
  const compromissos = await prisma.compromisso.findMany({
    orderBy: { dataMarcacao: 'asc' },
    include: { procedimentoRel: { select: { valor: true } } },
  });

  return compromissos.map((c) => ({
    ...c,
    valorCobrado: c.valorCobrado ? Number(c.valorCobrado) : null,
    procedimentoRel: c.procedimentoRel
      ? { valor: Number(c.procedimentoRel.valor) }
      : null,
  }));
}
