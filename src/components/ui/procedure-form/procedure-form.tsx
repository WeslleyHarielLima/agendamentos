'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { Pencil, Plus, X } from 'lucide-react';

import { criarProcedimento } from '@/actions/criar-procedimento';
import { atualizarProcedimento } from '@/actions/atualizar-procedimento';
import {
  procedimentoFormSchema,
  type ProcedimentoFormData,
} from '@/lib/schemas/procedimento-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ProcedimentoData = {
  id: string;
  nome: string;
  valor: number;
  descricao: string | null;
};

type ProcedimentoFormProps = {
  procedimento?: ProcedimentoData;
};

export function ProcedimentoForm({ procedimento }: ProcedimentoFormProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!procedimento;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProcedimentoFormData>({
    resolver: standardSchemaResolver(procedimentoFormSchema),
    defaultValues: procedimento
      ? {
          nome: procedimento.nome,
          valor: String(procedimento.valor),
          descricao: procedimento.descricao ?? '',
        }
      : undefined,
  });

  const onSubmit = async (formData: ProcedimentoFormData) => {
    const valor = Number(formData.valor);

    const result = isEdit
      ? await atualizarProcedimento({
          id: procedimento.id,
          nome: formData.nome,
          valor,
          descricao: formData.descricao || undefined,
        })
      : await criarProcedimento({
          nome: formData.nome,
          valor,
          descricao: formData.descricao || undefined,
        });

    if (result.success) {
      toast.success(
        isEdit ? 'Procedimento atualizado!' : 'Procedimento criado!'
      );
      if (!isEdit) reset();
      setOpen(false);
    } else {
      toast.error(result.error ?? 'Erro ao salvar procedimento');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {isEdit ? (
          <button
            className="p-1.5 text-content-secondary hover:text-content-primary rounded-md hover:bg-background-secondary transition-colors"
            aria-label="Editar procedimento"
          >
            <Pencil className="size-4" />
          </button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Novo Procedimento
          </Button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background-tertiary rounded-2xl p-6 shadow-2xl border border-border-primary focus:outline-none">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-label-large-size text-content-primary font-bold">
              {isEdit ? 'Editar Procedimento' : 'Novo Procedimento'}
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
              <Label htmlFor="nome">Nome do Procedimento</Label>
              <Input
                id="nome"
                placeholder="Ex: Extração de terceiro molar"
                {...register('nome')}
              />
              {errors.nome && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('valor')}
              />
              {errors.valor && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.valor.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o procedimento..."
                rows={3}
                {...register('descricao')}
              />
              {errors.descricao && (
                <p className="mt-1 text-paragraph-small-size text-destructive">
                  {errors.descricao.message}
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
                    : 'Salvar Procedimento'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
