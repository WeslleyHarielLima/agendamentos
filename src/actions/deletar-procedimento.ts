'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function deletarProcedimento(id: string) {
  try {
    await prisma.procedimento.update({
      where: { id },
      data: { ativo: false },
    });

    revalidatePath('/procedimentos');

    return { success: true };
  } catch (error) {
    console.error('[deletarProcedimento]', error);
    return {
      success: false,
      error: 'Erro ao desativar procedimento. Tente novamente.',
    };
  }
}
