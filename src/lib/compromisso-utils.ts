export type Compromisso = {
  id: string;
  pacienteNome: string;
  procedimento: string;
  telefone: string;
  descricao: string;
  dataMarcacao: Date;
};

export type PeriodoKey = 'manha' | 'tarde' | 'noite';

export type GruposPorPeriodo = Record<PeriodoKey, Compromisso[]>;

function getPeriodo(dataMarcacao: Date): PeriodoKey {
  const hora = dataMarcacao.getHours();
  if (hora >= 6 && hora < 12) return 'manha';
  if (hora >= 12 && hora < 18) return 'tarde';
  return 'noite';
}

export function grupoCompromissosporPeriodo(
  compromissos: Compromisso[]
): GruposPorPeriodo {
  return compromissos.reduce<GruposPorPeriodo>(
    (grupos, compromisso) => {
      const periodo = getPeriodo(compromisso.dataMarcacao);
      grupos[periodo].push(compromisso);
      return grupos;
    },
    { manha: [], tarde: [], noite: [] }
  );
}
