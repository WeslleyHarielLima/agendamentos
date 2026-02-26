import { createElement } from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { renderToBuffer } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { ReciboTemplate } from '@/lib/pdf/recibo-template';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const compromisso = await prisma.compromisso.findUnique({
    where: { id },
    include: {
      paciente: true,
      procedimentoRel: true,
    },
  });

  if (!compromisso) {
    return NextResponse.json(
      { error: 'Compromisso não encontrado' },
      { status: 404 }
    );
  }

  const data = {
    ...compromisso,
    valorCobrado: compromisso.valorCobrado
      ? Number(compromisso.valorCobrado)
      : null,
    paciente: compromisso.paciente
      ? {
          nome: compromisso.paciente.nome,
          cpf: compromisso.paciente.cpf,
          telefone: compromisso.paciente.telefone,
          email: compromisso.paciente.email,
          logradouro: compromisso.paciente.logradouro,
          numero: compromisso.paciente.numero,
          complemento: compromisso.paciente.complemento,
          bairro: compromisso.paciente.bairro,
          cidade: compromisso.paciente.cidade,
          estado: compromisso.paciente.estado,
          cep: compromisso.paciente.cep,
        }
      : null,
    procedimentoRel: compromisso.procedimentoRel
      ? { nome: compromisso.procedimentoRel.nome }
      : null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    createElement(ReciboTemplate, { compromisso: data }) as any
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="recibo-${id}.pdf"`,
    },
  });
}
