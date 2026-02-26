'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const finalizarSchema = z.object({
  id: z.string().min(1),
  valorCobrado: z.number().positive('Valor deve ser positivo'),
  observacao: z.string().optional(),
});

type FinalizarAtendimentoInput = {
  id: string;
  valorCobrado: number;
  observacao?: string;
};

export async function finalizarAtendimento(data: FinalizarAtendimentoInput) {
  const validated = finalizarSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
    };
  }

  try {
    await prisma.compromisso.update({
      where: { id: validated.data.id },
      data: {
        status: 'REALIZADO',
        valorCobrado: validated.data.valorCobrado,
        observacao: validated.data.observacao || null,
      },
    });

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[finalizarAtendimento]', error);
    return {
      success: false,
      error: 'Erro ao finalizar atendimento. Tente novamente.',
    };
  }
}
