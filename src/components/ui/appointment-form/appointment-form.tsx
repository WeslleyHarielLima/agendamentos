'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

import { criarCompromisso } from '@/actions/criar-compromisso';
import {
  compromissoFormSchema,
  type CompromissoFormData,
} from '@/lib/schemas/compromisso-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export function AppointmentForm() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompromissoFormData>({
    resolver: standardSchemaResolver(compromissoFormSchema),
  });

  const onSubmit = async (formData: CompromissoFormData) => {
    const dataMarcacao = new Date(`${formData.data}T${formData.hora}:00`);

    const result = await criarCompromisso({
      pacienteNome: formData.pacienteNome,
      procedimento: formData.procedimento,
      telefone: formData.telefone,
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

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('telefone', formatTelefone(e.target.value), {
      shouldValidate: true,
    });
  };

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
            {/* Nome do Paciente */}
            <div>
              <Label htmlFor="pacienteNome">Nome do Paciente</Label>
              <Input
                id="pacienteNome"
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
              <Label htmlFor="procedimento">Procedimento</Label>
              <Input
                id="procedimento"
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
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
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
