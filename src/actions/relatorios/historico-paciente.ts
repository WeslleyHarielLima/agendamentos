'use server';

import { prisma } from '@/lib/prisma';

export async function historicoPaciente(pacienteId: string) {
  const compromissos = await prisma.compromisso.findMany({
    where: { pacienteId },
    orderBy: { dataMarcacao: 'desc' },
    select: {
      id: true,
      procedimento: true,
      dataMarcacao: true,
      status: true,
      valorCobrado: true,
      observacao: true,
      procedimentoRel: { select: { valor: true } },
    },
  });

  return compromissos.map((c) => ({
    ...c,
    valorCobrado: c.valorCobrado ? Number(c.valorCobrado) : null,
    procedimentoRel: c.procedimentoRel
      ? { valor: Number(c.procedimentoRel.valor) }
      : null,
  }));
}
