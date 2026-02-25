'use client';

import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { X } from 'lucide-react';

import { atualizarCompromisso } from '@/actions/atualizar-compromisso';
import {
  compromissoFormSchema,
  type CompromissoFormData,
} from '@/lib/schemas/compromisso-schema';
import type { Compromisso } from '@/lib/compromisso-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeForInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length > 2) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length > 0) {
    return `(${digits}`;
  }
  return digits;
}

type EditAppointmentFormProps = {
  compromisso: Compromisso;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditAppointmentForm({
  compromisso,
  open,
  onOpenChange,
}: EditAppointmentFormProps) {
  const dataMarcacao = toDate(compromisso.dataMarcacao);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompromissoFormData>({
    resolver: standardSchemaResolver(compromissoFormSchema),
    defaultValues: {
      pacienteNome: compromisso.pacienteNome,
      procedimento: compromisso.procedimento,
      telefone: compromisso.telefone,
      descricao: compromisso.descricao,
      data: formatDateForInput(dataMarcacao),
      hora: formatTimeForInput(dataMarcacao),
    },
  });

  const onSubmit = async (formData: CompromissoFormData) => {
    const dataMarcacaoNova = new Date(`${formData.data}T${formData.hora}:00`);

    const result = await atualizarCompromisso({
      id: compromisso.id,
      pacienteNome: formData.pacienteNome,
      procedimento: formData.procedimento,
      telefone: formData.telefone,
      descricao: formData.descricao,
      dataMarcacao: dataMarcacaoNova,
    });

    if (result.success) {
      toast.success('Agendamento atualizado com sucesso!');
      onOpenChange(false);
    } else {
      toast.error(result.error ?? 'Erro ao atualizar agendamento');
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('telefone', formatTelefone(e.target.value), {
      shouldValidate: true,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background-tertiary rounded-2xl p-6 shadow-2xl border border-border-primary focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-label-large-size text-content-primary font-bold">
              Editar Agendamento
            </Dialog.Title>
            <button
              className="text-content-secondary hover:text-content-primary transition-colors rounded-md p-1 hover:bg-background-secondary"
              aria-label="Fechar"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome do Paciente */}
            <div>
              <Label htmlFor="edit-pacienteNome">Nome do Paciente</Label>
              <Input
                id="edit-pacienteNome"
                placeholder="Ex: Maria Silva"
                {...register('pacienteNome')}
              />
              {errors.pacienteNome && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.pacienteNome.message}
                </p>
              )}
            </div>

            {/* Procedimento */}
            <div>
              <Label htmlFor="edit-procedimento">Procedimento</Label>
              <Input
                id="edit-procedimento"
                placeholder="Ex: Extração de terceiro molar"
                {...register('procedimento')}
              />
              {errors.procedimento && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.procedimento.message}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input
                id="edit-telefone"
                placeholder="(00) 00000-0000"
                {...register('telefone')}
                onChange={handleTelefoneChange}
              />
              {errors.telefone && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.telefone.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                placeholder="Descreva o motivo da consulta..."
                rows={3}
                {...register('descricao')}
              />
              {errors.descricao && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.descricao.message}
                </p>
              )}
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-data">Data</Label>
                <Input
                  id="edit-data"
                  type="date"
                  className="date-input"
                  {...register('data')}
                />
                {errors.data && (
                  <p className="mt-1 text-paragraph-small-size text-destructive">
                    {errors.data.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-hora">Hora</Label>
                <Input
                  id="edit-hora"
                  type="time"
                  className="date-input"
                  {...register('hora')}
                />
                {errors.hora && (
                  <p className="mt-1 text-paragraph-small-size text-destructive">
                    {errors.hora.message}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  reset();
                  onOpenChange(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
