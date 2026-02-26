'use server';

import { prisma } from '@/lib/prisma';

export type ProcedimentoRanking = {
  procedimento: string;
  count: number;
  total: number;
};

export async function rankingProcedimentos(
  dias: number = 30
): Promise<ProcedimentoRanking[]> {
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - dias);
  inicio.setHours(0, 0, 0, 0);

  const compromissos = await prisma.compromisso.findMany({
    where: {
      status: 'REALIZADO',
      dataMarcacao: { gte: inicio },
    },
    select: {
      procedimento: true,
      valorCobrado: true,
      procedimentoRel: { select: { valor: true } },
    },
  });

  const mapa = new Map<string, { count: number; total: number }>();

  for (const c of compromissos) {
    const nome = c.procedimento;
    const valor = c.valorCobrado
      ? Number(c.valorCobrado)
      : c.procedimentoRel
        ? Number(c.procedimentoRel.valor)
        : 0;

    const atual = mapa.get(nome) ?? { count: 0, total: 0 };
    mapa.set(nome, { count: atual.count + 1, total: atual.total + valor });
  }

  return [...mapa.entries()]
    .map(([procedimento, { count, total }]) => ({ procedimento, count, total }))
    .sort((a, b) => b.count - a.count);
}
