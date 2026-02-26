'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { criarCompromissoSchema } from '@/lib/schemas/compromisso-schema';

type CriarCompromissoInput = {
  pacienteId: string;
  procedimentoId: string;
  descricao: string;
  dataMarcacao: Date;
};

export async function criarCompromisso(data: CriarCompromissoInput) {
  const validated = criarCompromissoSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
    };
  }

  try {
    const [paciente, procedimento] = await Promise.all([
      prisma.paciente.findUniqueOrThrow({
        where: { id: validated.data.pacienteId },
      }),
      prisma.procedimento.findUniqueOrThrow({
        where: { id: validated.data.procedimentoId },
      }),
    ]);

    await prisma.compromisso.create({
      data: {
        pacienteNome: paciente.nome,
        procedimento: procedimento.nome,
        telefone: paciente.telefone,
        descricao: validated.data.descricao,
        dataMarcacao: validated.data.dataMarcacao,
        pacienteId: validated.data.pacienteId,
        procedimentoId: validated.data.procedimentoId,
        status: 'AGENDADO',
      },
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
