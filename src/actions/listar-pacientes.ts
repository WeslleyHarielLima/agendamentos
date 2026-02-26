'use server';

import { prisma } from '@/lib/prisma';

export async function listarPacientes() {
  return prisma.paciente.findMany({
    orderBy: { nome: 'asc' },
  });
}
