import { Stethoscope } from 'lucide-react';

import { listarProcedimentos } from '@/actions/listar-procedimentos';
import { ProcedimentoForm } from '@/components/ui/procedure-form';
import { DesativarButton } from './desativar-button';

function formatBRL(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export default async function ProcedimentosPage() {
  const procedimentos = await listarProcedimentos();

  return (
    <main className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-background-tertiary border border-border-primary">
            <Stethoscope className="size-5 text-content-brand" />
          </div>
          <div>
            <h1 className="text-title-size font-bold text-content-primary leading-tight">
              Procedimentos
            </h1>
            <p className="text-paragraph-small-size text-content-secondary">
              {procedimentos.length}{' '}
              {procedimentos.length === 1
                ? 'procedimento ativo'
                : 'procedimentos ativos'}
            </p>
          </div>
        </div>
        <ProcedimentoForm />
      </div>

      {/* Table */}
      {procedimentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Stethoscope className="size-12 text-content-tertiary mb-4" />
          <p className="text-label-medium-size text-content-secondary mb-1">
            Nenhum procedimento cadastrado
          </p>
          <p className="text-paragraph-small-size text-content-tertiary">
            Clique em &quot;Novo Procedimento&quot; para começar.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border-primary overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-divisor bg-background-secondary">
                <th className="text-left px-4 py-3 text-label-small-size text-content-secondary font-medium">
                  Nome
                </th>
                <th className="text-left px-4 py-3 text-label-small-size text-content-secondary font-medium">
                  Valor
                </th>
                <th className="text-left px-4 py-3 text-label-small-size text-content-secondary font-medium hidden sm:table-cell">
                  Descrição
                </th>
                <th className="px-4 py-3 text-label-small-size text-content-secondary font-medium text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {procedimentos.map((p, i) => (
                <tr
                  key={p.id}
                  className={
                    i < procedimentos.length - 1
                      ? 'border-b border-border-divisor'
                      : ''
                  }
                >
                  <td className="px-4 py-3">
                    <span className="text-paragraph-medium-size text-content-primary font-medium">
                      {p.nome}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-paragraph-medium-size text-content-brand font-medium">
                      {formatBRL(p.valor)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-paragraph-medium-size text-content-secondary">
                      {p.descricao ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <ProcedimentoForm procedimento={p} />
                      <DesativarButton id={p.id} nome={p.nome} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
