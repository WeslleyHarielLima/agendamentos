import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const compromissos = await prisma.compromisso.findMany({
    where: { status: 'REALIZADO' },
    orderBy: { dataMarcacao: 'asc' },
    select: {
      id: true,
      pacienteNome: true,
      procedimento: true,
      telefone: true,
      dataMarcacao: true,
      valorCobrado: true,
      observacao: true,
      procedimentoRel: { select: { valor: true } },
    },
  });

  const cabecalho = [
    'ID',
    'Paciente',
    'Procedimento',
    'Telefone',
    'Data',
    'Hora',
    'Valor Cobrado (R$)',
    'Observação',
  ];

  const linhas = compromissos.map((c) => {
    const d = c.dataMarcacao;
    const data = d.toLocaleDateString('pt-BR');
    const hora = d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const valor = c.valorCobrado
      ? Number(c.valorCobrado).toFixed(2).replace('.', ',')
      : c.procedimentoRel
        ? Number(c.procedimentoRel.valor).toFixed(2).replace('.', ',')
        : '0,00';

    return [
      c.id,
      c.pacienteNome,
      c.procedimento,
      c.telefone,
      data,
      hora,
      valor,
      c.observacao ?? '',
    ];
  });

  const todasLinhas = [cabecalho, ...linhas];
  const csv = todasLinhas
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')
    )
    .join('\r\n');

  const bom = '\uFEFF';
  const hoje = new Date().toISOString().split('T')[0];

  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="atendimentos-${hoje}.csv"`,
    },
  });
}
