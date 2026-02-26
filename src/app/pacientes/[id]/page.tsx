import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
} from 'lucide-react';

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

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-paragraph-small-size text-content-tertiary">{label}</p>
      <p className="text-paragraph-medium-size text-content-primary">{value}</p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background-secondary border border-border-primary rounded-2xl p-5">
      <h3 className="text-label-medium-size text-content-primary mb-4 flex items-center gap-2">
        <span className="text-content-brand">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

type PageProps = {
  params: Promise<{ id: string }>;
};

const SEXO_LABEL: Record<string, string> = {
  MASCULINO: 'Masculino',
  FEMININO: 'Feminino',
  OUTRO: 'Outro',
};

export default async function PacienteDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const paciente = await buscarPaciente(id);

  if (!paciente) notFound();

  const dataNasc = paciente.dataNascimento
    ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')
    : null;

  const enderecoLinha1 = [
    paciente.logradouro,
    paciente.numero,
    paciente.complemento,
  ]
    .filter(Boolean)
    .join(', ');
  const enderecoLinha2 = [paciente.bairro, paciente.cidade, paciente.estado]
    .filter(Boolean)
    .join(', ');
  const cepFormatado = paciente.cep;

  const temEndereco = enderecoLinha1 || enderecoLinha2 || cepFormatado;

  return (
    <div className="bg-background-primary p-6">
      <div className="md:m-8 mb-8 max-w-4xl">
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
          <p className="text-paragraph-medium-size text-content-tertiary">
            {paciente.cpf ? `CPF: ${paciente.cpf}` : 'Paciente cadastrado'}
            {dataNasc ? ` · ${dataNasc}` : ''}
            {paciente.sexo
              ? ` · ${SEXO_LABEL[paciente.sexo] ?? paciente.sexo}`
              : ''}
          </p>
        </div>

        {/* Info cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Contato */}
          <SectionCard icon={<Phone className="size-4" />} title="Contato">
            <div className="space-y-3">
              <InfoRow label="Telefone" value={paciente.telefone} />
              <InfoRow label="E-mail" value={paciente.email} />
            </div>
          </SectionCard>

          {/* Endereço */}
          {temEndereco ? (
            <SectionCard icon={<MapPin className="size-4" />} title="Endereço">
              <div className="space-y-1">
                {enderecoLinha1 && (
                  <p className="text-paragraph-medium-size text-content-primary">
                    {enderecoLinha1}
                  </p>
                )}
                {enderecoLinha2 && (
                  <p className="text-paragraph-medium-size text-content-primary">
                    {enderecoLinha2}
                  </p>
                )}
                {cepFormatado && (
                  <p className="text-paragraph-small-size text-content-tertiary">
                    CEP: {cepFormatado}
                  </p>
                )}
              </div>
            </SectionCard>
          ) : (
            <SectionCard icon={<MapPin className="size-4" />} title="Endereço">
              <p className="text-paragraph-small-size text-content-tertiary">
                Não informado.
              </p>
            </SectionCard>
          )}

          {/* Dados pessoais */}
          <SectionCard
            icon={<User className="size-4" />}
            title="Dados Pessoais"
          >
            <div className="space-y-3">
              <InfoRow label="CPF" value={paciente.cpf} />
              <InfoRow label="Data de Nascimento" value={dataNasc} />
              <InfoRow
                label="Sexo"
                value={
                  paciente.sexo
                    ? (SEXO_LABEL[paciente.sexo] ?? paciente.sexo)
                    : null
                }
              />
              {!paciente.cpf && !dataNasc && !paciente.sexo && (
                <p className="text-paragraph-small-size text-content-tertiary">
                  Não informado.
                </p>
              )}
            </div>
          </SectionCard>

          {/* Observações clínicas */}
          <SectionCard
            icon={<FileText className="size-4" />}
            title="Informações Clínicas"
          >
            {paciente.observacoes ? (
              <p className="text-paragraph-medium-size text-content-secondary whitespace-pre-wrap">
                {paciente.observacoes}
              </p>
            ) : (
              <p className="text-paragraph-small-size text-content-tertiary">
                Nenhuma observação.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Histórico */}
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
