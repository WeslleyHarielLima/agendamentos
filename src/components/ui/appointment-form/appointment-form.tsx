'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

import { criarCompromisso } from '@/actions/criar-compromisso';
import {
  novoAgendamentoFormSchema,
  type NovoAgendamentoFormData,
} from '@/lib/schemas/compromisso-schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Combobox, type ComboboxItem } from '@/components/ui/combobox';
import { PatientForm } from '@/components/ui/patient-form';

type PacienteBasico = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
};

type ProcedimentoBasico = {
  id: string;
  nome: string;
  valor: number;
};

type AppointmentFormProps = {
  pacientes: PacienteBasico[];
  procedimentos: ProcedimentoBasico[];
};

export function AppointmentForm({
  pacientes: initialPacientes,
  procedimentos,
}: AppointmentFormProps) {
  const [open, setOpen] = useState(false);
  const [pacientes, setPacientes] = useState(initialPacientes);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NovoAgendamentoFormData>({
    resolver: standardSchemaResolver(novoAgendamentoFormSchema),
  });

  const pacienteIdSelecionado = watch('pacienteId');
  const procedimentoIdSelecionado = watch('procedimentoId');

  const pacienteItems: ComboboxItem[] = pacientes.map((p) => ({
    id: p.id,
    label: p.nome,
    sublabel: p.telefone,
  }));

  const procedimentoItems: ComboboxItem[] = procedimentos.map((p) => ({
    id: p.id,
    label: p.nome,
    sublabel: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(p.valor),
  }));

  const onSubmit = async (formData: NovoAgendamentoFormData) => {
    const dataMarcacao = new Date(`${formData.data}T${formData.hora}:00`);

    const result = await criarCompromisso({
      pacienteId: formData.pacienteId,
      procedimentoId: formData.procedimentoId,
      descricao: formData.descricao,
      dataMarcacao,
    });

    if (result.success) {
      toast.success('Agendamento criado com sucesso!');
      reset();
      setOpen(false);
    } else {
      toast.error(result.error ?? 'Erro ao criar agendamento');
    }
  };

  const handlePatientCreated = (novoPaciente: PacienteBasico) => {
    setPacientes((prev) =>
      [...prev, novoPaciente].sort((a, b) => a.nome.localeCompare(b.nome))
    );
    setValue('pacienteId', novoPaciente.id, { shouldValidate: true });
  };

  const procedimentoSelecionado = procedimentos.find(
    (p) => p.id === procedimentoIdSelecionado
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <Plus className="size-4" />
          Novo Agendamento
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background-tertiary rounded-2xl p-6 shadow-2xl border border-border-primary focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-label-large-size text-content-primary font-bold">
              Novo Agendamento
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-content-secondary hover:text-content-primary transition-colors rounded-md p-1 hover:bg-background-secondary"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Paciente */}
            <div>
              <Label htmlFor="pacienteId">Paciente</Label>
              <Controller
                name="pacienteId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    items={pacienteItems}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    placeholder="Selecione um paciente..."
                    searchPlaceholder="Buscar paciente..."
                    emptyMessage="Nenhum paciente encontrado."
                    error={!!errors.pacienteId}
                    footer={
                      <PatientForm onCreated={handlePatientCreated}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-paragraph-small-size text-content-brand hover:bg-background-secondary transition-colors"
                        >
                          <Plus className="size-3.5" />
                          Cadastrar novo paciente
                        </button>
                      </PatientForm>
                    }
                  />
                )}
              />
              {errors.pacienteId && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.pacienteId.message}
                </p>
              )}
              {pacienteIdSelecionado && (
                <p className="mt-1 text-paragraph-small-size text-content-tertiary">
                  Tel:{' '}
                  {
                    pacientes.find((p) => p.id === pacienteIdSelecionado)
                      ?.telefone
                  }
                </p>
              )}
            </div>

            {/* Procedimento */}
            <div>
              <Label htmlFor="procedimentoId">Procedimento</Label>
              <Controller
                name="procedimentoId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    items={procedimentoItems}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    placeholder="Selecione um procedimento..."
                    searchPlaceholder="Buscar procedimento..."
                    emptyMessage="Nenhum procedimento encontrado."
                    error={!!errors.procedimentoId}
                  />
                )}
              />
              {errors.procedimentoId && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.procedimentoId.message}
                </p>
              )}
              {procedimentoSelecionado && (
                <p className="mt-1 text-paragraph-small-size text-content-tertiary">
                  Valor:{' '}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(procedimentoSelecionado.valor)}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
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
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
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
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
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
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" onClick={() => reset()}>
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
