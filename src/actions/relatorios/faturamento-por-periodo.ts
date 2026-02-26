'use server';

import { prisma } from '@/lib/prisma';

export type FaturamentoDia = {
  data: string;
  total: number;
};

export type FaturamentoResumo = {
  porDia: FaturamentoDia[];
  totalGeral: number;
  totalAtendimentos: number;
  ticketMedio: number;
};

export async function faturamentoPorPeriodo(
  dias: number = 30
): Promise<FaturamentoResumo> {
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - dias);
  inicio.setHours(0, 0, 0, 0);

  const compromissos = await prisma.compromisso.findMany({
    where: {
      status: 'REALIZADO',
      dataMarcacao: { gte: inicio },
    },
    select: {
      dataMarcacao: true,
      valorCobrado: true,
      procedimentoRel: { select: { valor: true } },
    },
    orderBy: { dataMarcacao: 'asc' },
  });

  const porData = new Map<string, number>();
  let totalGeral = 0;

  for (const c of compromissos) {
    const valor = c.valorCobrado
      ? Number(c.valorCobrado)
      : c.procedimentoRel
        ? Number(c.procedimentoRel.valor)
        : 0;

    const d = c.dataMarcacao;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    porData.set(key, (porData.get(key) ?? 0) + valor);
    totalGeral += valor;
  }

  const porDia = [...porData.entries()].map(([data, total]) => ({
    data,
    total,
  }));

  const totalAtendimentos = compromissos.length;
  const ticketMedio =
    totalAtendimentos > 0 ? totalGeral / totalAtendimentos : 0;

  return { porDia, totalGeral, totalAtendimentos, ticketMedio };
}
