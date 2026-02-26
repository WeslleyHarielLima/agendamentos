import Link from 'next/link';
import {
  BarChart2,
  Stethoscope,
  User,
  Download,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react';

import { faturamentoPorPeriodo } from '@/actions/relatorios/faturamento-por-periodo';
import { rankingProcedimentos } from '@/actions/relatorios/ranking-procedimentos';
import { historicoPaciente } from '@/actions/relatorios/historico-paciente';
import { listarPacientes } from '@/actions/listar-pacientes';

import { StatCard } from '@/components/ui/relatorios/stat-card';
import { BarChart } from '@/components/ui/relatorios/bar-chart';
import { PeriodFilter } from '@/components/ui/relatorios/period-filter';
import { PatientSelect } from '@/components/ui/relatorios/patient-select';

type SearchParams = Promise<{
  aba?: string;
  periodo?: string;
  pacienteId?: string;
}>;

const ABAS = [
  { key: 'faturamento', label: 'Faturamento', icon: TrendingUp },
  { key: 'procedimentos', label: 'Procedimentos', icon: Stethoscope },
  { key: 'historico', label: 'Histórico', icon: User },
  { key: 'exportar', label: 'Exportar', icon: Download },
];

function formatBRL(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatData(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

const STATUS_LABEL: Record<string, string> = {
  AGENDADO: 'Agendado',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
};

const STATUS_CLASS: Record<string, string> = {
  AGENDADO: 'bg-background-secondary text-content-secondary',
  REALIZADO: 'bg-green-500/15 text-green-400',
  CANCELADO: 'bg-red-500/15 text-destructive',
};

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const aba = params.aba ?? 'faturamento';
  const periodo = params.periodo ?? '30';
  const pacienteId = params.pacienteId ?? '';
  const dias = parseInt(periodo, 10) || 30;

  const pacientes = await listarPacientes();

  let faturamento = null;
  let ranking = null;
  let historico = null;
  let pacienteSelecionado = null;

  if (aba === 'faturamento') {
    faturamento = await faturamentoPorPeriodo(dias);
  } else if (aba === 'procedimentos') {
    ranking = await rankingProcedimentos(dias);
  } else if (aba === 'historico') {
    if (pacienteId) {
      historico = await historicoPaciente(pacienteId);
      pacienteSelecionado = pacientes.find((p) => p.id === pacienteId);
    }
  }

  return (
    <main className="px-6 py-8 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center size-10 rounded-xl bg-background-tertiary border border-border-primary">
          <BarChart2 className="size-5 text-content-brand" />
        </div>
        <div>
          <h1 className="text-title-size font-bold text-content-primary leading-tight">
            Relatórios
          </h1>
          <p className="text-paragraph-small-size text-content-secondary">
            Análise de faturamento, procedimentos e atendimentos.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background-tertiary rounded-xl p-1 border border-border-primary mb-6">
        {ABAS.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={`/relatorios?aba=${key}&periodo=${periodo}${key === 'historico' && pacienteId ? `&pacienteId=${pacienteId}` : ''}`}
            className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-lg text-paragraph-small-size font-medium transition-colors ${
              aba === key
                ? 'bg-content-brand text-white'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── ABA: FATURAMENTO ── */}
      {aba === 'faturamento' && faturamento && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-label-large-size text-content-primary">
              Faturamento
            </h2>
            <PeriodFilter periodoAtual={periodo} />
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total no período"
              value={formatBRL(faturamento.totalGeral)}
              sub={`Últimos ${dias} dias`}
              highlight
            />
            <StatCard
              label="Atendimentos realizados"
              value={String(faturamento.totalAtendimentos)}
              sub="Com status Realizado"
            />
            <StatCard
              label="Ticket médio"
              value={formatBRL(faturamento.ticketMedio)}
              sub="Por atendimento"
            />
          </div>

          {/* Gráfico */}
          <div className="bg-background-tertiary rounded-xl border border-border-primary p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="size-4 text-content-brand" />
              <h3 className="text-label-medium-size text-content-primary">
                Faturamento por dia
              </h3>
            </div>
            <BarChart
              data={faturamento.porDia.map((d) => ({
                label: d.data,
                value: d.total,
              }))}
              formatValue={formatBRL}
              height={160}
            />
          </div>
        </div>
      )}

      {/* ── ABA: PROCEDIMENTOS ── */}
      {aba === 'procedimentos' && ranking && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-label-large-size text-content-primary">
              Ranking de Procedimentos
            </h2>
            <PeriodFilter periodoAtual={periodo} />
          </div>

          {ranking.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-background-tertiary rounded-xl border border-border-primary">
              <Stethoscope className="size-10 text-content-tertiary mb-3" />
              <p className="text-label-medium-size text-content-secondary">
                Nenhum atendimento realizado no período.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border-primary overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-background-secondary border-b border-border-divisor">
                    <th className="text-left px-4 py-3 text-label-small-size text-content-secondary font-medium w-8">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-label-small-size text-content-secondary font-medium">
                      Procedimento
                    </th>
                    <th className="text-right px-4 py-3 text-label-small-size text-content-secondary font-medium">
                      Atendimentos
                    </th>
                    <th className="text-right px-4 py-3 text-label-small-size text-content-secondary font-medium">
                      Receita gerada
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r, i) => (
                    <tr
                      key={r.procedimento}
                      className={
                        i < ranking.length - 1
                          ? 'border-b border-border-divisor'
                          : ''
                      }
                    >
                      <td className="px-4 py-3 text-content-tertiary text-paragraph-small-size">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 text-content-primary text-paragraph-medium-size font-medium">
                        {r.procedimento}
                      </td>
                      <td className="px-4 py-3 text-right text-content-secondary text-paragraph-medium-size">
                        {r.count}
                      </td>
                      <td className="px-4 py-3 text-right text-content-brand text-paragraph-medium-size font-medium">
                        {formatBRL(r.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ABA: HISTÓRICO ── */}
      {aba === 'historico' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-label-large-size text-content-primary">
              Histórico por Paciente
            </h2>
            <PatientSelect
              pacientes={pacientes.map((p) => ({ id: p.id, nome: p.nome }))}
              pacienteIdAtual={pacienteId}
            />
          </div>

          {!pacienteId && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-background-tertiary rounded-xl border border-border-primary">
              <User className="size-10 text-content-tertiary mb-3" />
              <p className="text-label-medium-size text-content-secondary">
                Selecione um paciente para ver o histórico.
              </p>
            </div>
          )}

          {pacienteId && historico && (
            <>
              {pacienteSelecionado && (
                <div className="flex items-center gap-3 bg-background-tertiary rounded-xl border border-border-primary px-5 py-4">
                  <div className="flex items-center justify-center size-9 rounded-full bg-content-brand/15">
                    <User className="size-4 text-content-brand" />
                  </div>
                  <div>
                    <p className="text-label-medium-size text-content-primary">
                      {pacienteSelecionado.nome}
                    </p>
                    <p className="text-paragraph-small-size text-content-secondary">
                      {historico.length}{' '}
                      {historico.length === 1 ? 'atendimento' : 'atendimentos'}{' '}
                      registrado{historico.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              {historico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-background-tertiary rounded-xl border border-border-primary">
                  <Calendar className="size-10 text-content-tertiary mb-3" />
                  <p className="text-label-medium-size text-content-secondary">
                    Nenhum atendimento registrado.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border-primary overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-background-secondary border-b border-border-divisor">
                        <th className="text-left px-4 py-3 text-label-small-size text-content-secondary font-medium">
                          Data
                        </th>
                        <th className="text-left px-4 py-3 text-label-small-size text-content-secondary font-medium">
                          Procedimento
                        </th>
                        <th className="text-left px-4 py-3 text-label-small-size text-content-secondary font-medium hidden sm:table-cell">
                          Status
                        </th>
                        <th className="text-right px-4 py-3 text-label-small-size text-content-secondary font-medium">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historico.map((c, i) => {
                        const d = c.dataMarcacao;
                        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        const valor =
                          c.valorCobrado ?? c.procedimentoRel?.valor ?? null;
                        return (
                          <tr
                            key={c.id}
                            className={
                              i < historico.length - 1
                                ? 'border-b border-border-divisor'
                                : ''
                            }
                          >
                            <td className="px-4 py-3 text-content-secondary text-paragraph-medium-size">
                              {formatData(dateStr)}
                            </td>
                            <td className="px-4 py-3 text-content-primary text-paragraph-medium-size font-medium">
                              {c.procedimento}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-paragraph-small-size font-medium ${STATUS_CLASS[c.status]}`}
                              >
                                {STATUS_LABEL[c.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-paragraph-medium-size font-medium">
                              {valor !== null ? (
                                <span className="text-content-brand">
                                  {formatBRL(valor)}
                                </span>
                              ) : (
                                <span className="text-content-tertiary">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ABA: EXPORTAR ── */}
      {aba === 'exportar' && (
        <div className="space-y-6">
          <h2 className="text-label-large-size text-content-primary">
            Exportar Dados
          </h2>

          <div className="bg-background-tertiary rounded-xl border border-border-primary p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center size-10 rounded-xl bg-content-brand/15 shrink-0">
                <Download className="size-5 text-content-brand" />
              </div>
              <div className="flex-1">
                <h3 className="text-label-medium-size text-content-primary mb-1">
                  Relatório de Atendimentos (CSV)
                </h3>
                <p className="text-paragraph-small-size text-content-secondary mb-4">
                  Exporta todos os atendimentos com status{' '}
                  <strong className="text-content-primary">Realizado</strong>,
                  incluindo paciente, procedimento, data e valor cobrado.
                  Compatível com Excel e Google Planilhas.
                </p>
                <a
                  href="/api/exportar"
                  download
                  className="inline-flex items-center gap-2 bg-content-brand text-white px-4 py-2 rounded-lg text-paragraph-small-size font-medium hover:bg-accent-primary-light transition-colors"
                >
                  <Download className="size-4" />
                  Baixar CSV
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
