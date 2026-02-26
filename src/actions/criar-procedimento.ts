'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { procedimentoSchema } from '@/lib/schemas/procedimento-schema';

type CriarProcedimentoInput = {
  nome: string;
  valor: number;
  descricao?: string;
};

export async function criarProcedimento(data: CriarProcedimentoInput) {
  const validated = procedimentoSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
    };
  }

  try {
    await prisma.procedimento.create({
      data: validated.data,
    });

    revalidatePath('/procedimentos');

    return { success: true };
  } catch (error) {
    console.error('[criarProcedimento]', error);
    return {
      success: false,
      error: 'Erro ao salvar procedimento. Tente novamente.',
    };
  }
}
