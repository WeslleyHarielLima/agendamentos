'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function deletarCompromisso(id: string) {
  try {
    await prisma.compromisso.delete({
      where: { id },
    });

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[deletarCompromisso]', error);
    return {
      success: false,
      error: 'Erro ao excluir agendamento. Tente novamente.',
    };
  }
}
