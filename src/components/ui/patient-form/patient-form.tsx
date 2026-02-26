'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

import { criarPaciente } from '@/actions/criar-paciente';
import { atualizarPaciente } from '@/actions/atualizar-paciente';
import {
  pacienteFormSchema,
  type PacienteFormData,
} from '@/lib/schemas/paciente-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

type PacienteData = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
};

type PatientFormProps = {
  paciente?: PacienteData;
  onCreated?: (paciente: PacienteData) => void;
  children?: React.ReactNode;
};

export function PatientForm({
  paciente,
  onCreated,
  children,
}: PatientFormProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!paciente;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PacienteFormData>({
    resolver: standardSchemaResolver(pacienteFormSchema),
    defaultValues: paciente
      ? {
          nome: paciente.nome,
          telefone: paciente.telefone,
          email: paciente.email ?? '',
        }
      : undefined,
  });

  const onSubmit = async (formData: PacienteFormData) => {
    if (isEdit) {
      const result = await atualizarPaciente({
        id: paciente.id,
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email || undefined,
      });
      if (result.success) {
        toast.success('Paciente atualizado!');
        setOpen(false);
      } else {
        toast.error(result.error ?? 'Erro ao salvar paciente');
      }
      return;
    }

    const result = await criarPaciente({
      nome: formData.nome,
      telefone: formData.telefone,
      email: formData.email || undefined,
    });

    if (result.success) {
      toast.success('Paciente cadastrado!');
      reset();
      if (onCreated) onCreated(result.data);
      setOpen(false);
    } else {
      toast.error(result.error ?? 'Erro ao salvar paciente');
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
        {children ?? (
          <Button>
            <Plus className="size-4" />
            Novo Paciente
          </Button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-md bg-background-tertiary rounded-2xl p-6 shadow-2xl border border-border-primary focus:outline-none">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-label-large-size text-content-primary font-bold">
              {isEdit ? 'Editar Paciente' : 'Novo Paciente'}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                placeholder="Ex: Maria Silva"
                {...register('nome')}
              />
              {errors.nome && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="telefone-paciente">Telefone</Label>
              <Input
                id="telefone-paciente"
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

            <div>
              <Label htmlFor="email-paciente">E-mail (opcional)</Label>
              <Input
                id="email-paciente"
                type="email"
                placeholder="Ex: maria@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => !isEdit && reset()}
                >
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Salvando...'
                  : isEdit
                    ? 'Salvar Alterações'
                    : 'Cadastrar Paciente'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
