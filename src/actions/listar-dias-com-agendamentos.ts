'use server';

import { prisma } from '@/lib/prisma';

export async function listarDiasComAgendamentos(
  mes: string
): Promise<number[]> {
  const [year, month] = mes.split('-').map(Number);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const compromissos = await prisma.compromisso.findMany({
    where: { dataMarcacao: { gte: start, lte: end } },
    select: { dataMarcacao: true },
  });

  const dias = new Set(compromissos.map((c) => c.dataMarcacao.getDate()));
  return [...dias];
}
