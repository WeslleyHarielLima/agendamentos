'use server';

import { prisma } from '@/lib/prisma';

export async function buscarPaciente(id: string) {
  return prisma.paciente.findUnique({
    where: { id },
    include: {
      compromissos: {
        orderBy: { dataMarcacao: 'desc' },
        include: { procedimentoRel: { select: { nome: true, valor: true } } },
      },
    },
  });
}
