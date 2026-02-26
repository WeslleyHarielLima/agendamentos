'use client';

import { useState } from 'react';
import {
  User,
  Stethoscope,
  Phone,
  Clock,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  CheckCheck,
  FileDown,
} from 'lucide-react';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';

import type { Compromisso } from '@/lib/compromisso-utils';
import { deletarCompromisso } from '@/actions/deletar-compromisso';
import { EditAppointmentForm } from '@/components/ui/edit-appointment-form';
import { FinalizarAtendimentoDialog } from '@/components/ui/finalizar-atendimento-dialog';
import { Button } from '@/components/ui/button';

type AppointmentCardProps = {
  compromisso: Compromisso;
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatHora(data: Date | string): string {
  return toDate(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function StatusBadge({ status }: { status: Compromisso['status'] }) {
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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-paragraph-small-size bg-background-primary text-content-tertiary">
      <Clock className="size-3" />
      Agendado
    </span>
  );
}

export function AppointmentCard({ compromisso }: AppointmentCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [finalizarOpen, setFinalizarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletarCompromisso(compromisso.id);
    if (result.success) {
      toast.success('Agendamento excluído com sucesso!');
      setDeleteOpen(false);
    } else {
      toast.error(result.error ?? 'Erro ao excluir agendamento');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 px-5 py-4 border-b border-border-divisor last:border-b-0 hover:bg-background-secondary transition-colors group">
        {/* Horário */}
        <div className="flex items-center gap-1.5 min-w-14 pt-0.5">
          <Clock className="size-3.5 text-content-tertiary shrink-0" />
          <span className="text-label-small-size text-content-tertiary">
            {formatHora(compromisso.dataMarcacao)}
          </span>
        </div>

        {/* Divider vertical */}
        <div className="w-px self-stretch bg-border-divisor shrink-0" />

        {/* Conteúdo */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <User className="size-3.5 text-content-brand shrink-0" />
            <span className="text-label-medium-size text-content-primary truncate">
              {compromisso.pacienteNome}
            </span>
            <StatusBadge status={compromisso.status} />
          </div>

          <div className="flex items-center gap-2">
            <Stethoscope className="size-3.5 text-content-secondary shrink-0" />
            <span className="text-paragraph-medium-size text-content-secondary truncate">
              {compromisso.procedimento}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="size-3.5 text-content-tertiary shrink-0" />
            <span className="text-paragraph-small-size text-content-tertiary">
              {compromisso.telefone}
            </span>
          </div>

          {compromisso.valorCobrado !== null && (
            <span className="text-paragraph-small-size text-content-brand">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(compromisso.valorCobrado)}
            </span>
          )}
        </div>

        {/* Botões de ação — visíveis ao hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
          {compromisso.status === 'AGENDADO' && (
            <button
              onClick={() => setFinalizarOpen(true)}
              className="p-1.5 rounded-md text-content-tertiary hover:text-green-400 hover:bg-background-primary transition-colors"
              aria-label="Finalizar atendimento"
            >
              <CheckCheck className="size-3.5" />
            </button>
          )}
          {compromisso.status === 'REALIZADO' && (
            <button
              onClick={() =>
                window.open(`/api/recibo/${compromisso.id}`, '_blank')
              }
              className="p-1.5 rounded-md text-content-tertiary hover:text-content-brand hover:bg-background-primary transition-colors"
              aria-label="Baixar recibo"
            >
              <FileDown className="size-3.5" />
            </button>
          )}
          <button
            onClick={() => setEditOpen(true)}
            className="p-1.5 rounded-md text-content-tertiary hover:text-content-primary hover:bg-background-primary transition-colors"
            aria-label="Editar agendamento"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="p-1.5 rounded-md text-content-tertiary hover:text-destructive hover:bg-background-primary transition-colors"
            aria-label="Excluir agendamento"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Dialog de edição */}
      <EditAppointmentForm
        compromisso={compromisso}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Dialog de finalização */}
      <FinalizarAtendimentoDialog
        compromisso={compromisso}
        open={finalizarOpen}
        onOpenChange={setFinalizarOpen}
      />

      {/* Dialog de confirmação de exclusão */}
      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-background-tertiary rounded-2xl p-6 shadow-2xl border border-border-primary focus:outline-none">
            <Dialog.Title className="text-label-large-size text-content-primary font-bold mb-2">
              Excluir Agendamento
            </Dialog.Title>
            <Dialog.Description className="text-paragraph-medium-size text-content-secondary mb-6">
              Tem certeza que deseja excluir o agendamento de{' '}
              <span className="text-content-primary font-medium">
                {compromisso.pacienteNome}
              </span>
              ? Esta ação não pode ser desfeita.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
