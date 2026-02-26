'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function deletarPaciente(id: string) {
  try {
    await prisma.paciente.delete({ where: { id } });
    revalidatePath('/pacientes');
    return { success: true };
  } catch (error) {
    console.error('[deletarPaciente]', error);
    return {
      success: false,
      error: 'Erro ao excluir paciente. Tente novamente.',
    };
  }
}
