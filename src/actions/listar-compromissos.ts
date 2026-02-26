'use server';

import { prisma } from '@/lib/prisma';

export async function listarCompromissos(filtro?: { data?: string }) {
  let whereClause = {};

  if (filtro?.data) {
    const [year, month, day] = filtro.data.split('-').map(Number);
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);
    whereClause = { dataMarcacao: { gte: start, lte: end } };
  }

  const compromissos = await prisma.compromisso.findMany({
    where: whereClause,
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
