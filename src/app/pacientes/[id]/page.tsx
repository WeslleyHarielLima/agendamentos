import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

import { buscarPaciente } from '@/actions/buscar-paciente';

function StatusBadge({ status }: { status: string }) {
  if (status === 'REALIZADO') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-paragraph-small-size bg-green-500/15 text-green-400">
        <CheckCircle className="size-3" />
        Realizado
      </span>
    );
  }
  if (status === 'CANCELADO') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-paragraph-small-size bg-red-500/15 text-destructive">
        <XCircle className="size-3" />
        Cancelado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-paragraph-small-size bg-background-secondary text-content-secondary">
      <Clock className="size-3" />
      Agendado
    </span>
  );
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PacienteDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const paciente = await buscarPaciente(id);

  if (!paciente) notFound();

  return (
    <div className="bg-background-primary p-6">
      <div className="md:m-8 mb-8">
        {/* Back */}
        <Link
          href="/pacientes"
          className="inline-flex items-center gap-1.5 text-paragraph-medium-size text-content-secondary hover:text-content-primary transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Voltar para Pacientes
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-title-size text-content-primary mb-1">
            {paciente.nome}
          </h1>
          <div className="flex flex-wrap gap-3 text-paragraph-medium-size text-content-secondary">
            <span>{paciente.telefone}</span>
            {paciente.email && <span>·</span>}
            {paciente.email && <span>{paciente.email}</span>}
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-label-large-size text-content-primary mb-4 flex items-center gap-2">
            <Calendar className="size-5 text-content-brand" />
            Histórico de Atendimentos
            <span className="text-paragraph-medium-size text-content-tertiary font-normal">
              ({paciente.compromissos.length})
            </span>
          </h2>

          {paciente.compromissos.length === 0 ? (
            <p className="text-paragraph-medium-size text-content-tertiary py-8 text-center">
              Nenhum atendimento registrado para este paciente.
            </p>
          ) : (
            <div className="bg-background-secondary border border-border-primary rounded-2xl overflow-hidden">
              {paciente.compromissos.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-4 px-5 py-4 border-b border-border-divisor last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-label-medium-size text-content-primary">
                        {c.procedimentoRel?.nome ?? c.procedimento}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-paragraph-small-size text-content-tertiary">
                      {new Date(c.dataMarcacao).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {c.descricao && (
                      <p className="text-paragraph-small-size text-content-secondary mt-1 truncate">
                        {c.descricao}
                      </p>
                    )}
                  </div>
                  {c.valorCobrado && (
                    <span className="text-label-small-size text-content-brand shrink-0">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(c.valorCobrado))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
