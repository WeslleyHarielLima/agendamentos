'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { compromissoSchema } from '@/lib/schemas/compromisso-schema';

type CriarCompromissoInput = {
  pacienteNome: string;
  procedimento: string;
  telefone: string;
  descricao: string;
  dataMarcacao: Date;
};

export async function criarCompromisso(data: CriarCompromissoInput) {
  const validated = compromissoSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
    };
  }

  try {
    await prisma.compromisso.create({
      data: validated.data,
    });

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[criarCompromisso]', error);
    return {
      success: false,
      error: 'Erro ao salvar agendamento. Tente novamente.',
    };
  }
}
