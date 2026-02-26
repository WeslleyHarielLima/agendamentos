'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { procedimentoSchema } from '@/lib/schemas/procedimento-schema';

type AtualizarProcedimentoInput = {
  id: string;
  nome: string;
  valor: number;
  descricao?: string;
};

export async function atualizarProcedimento(data: AtualizarProcedimentoInput) {
  const { id, ...rest } = data;
  const validated = procedimentoSchema.safeParse(rest);

  if (!validated.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
    };
  }

  try {
    await prisma.procedimento.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath('/procedimentos');

    return { success: true };
  } catch (error) {
    console.error('[atualizarProcedimento]', error);
    return {
      success: false,
      error: 'Erro ao atualizar procedimento. Tente novamente.',
    };
  }
}
