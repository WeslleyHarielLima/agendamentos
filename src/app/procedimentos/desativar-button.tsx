'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { Trash2, X } from 'lucide-react';

import { deletarProcedimento } from '@/actions/deletar-procedimento';
import { Button } from '@/components/ui/button';

type DesativarButtonProps = {
  id: string;
  nome: string;
};

export function DesativarButton({ id, nome }: DesativarButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDesativar = async () => {
    setIsLoading(true);
    const result = await deletarProcedimento(id);
    setIsLoading(false);

    if (result.success) {
      toast.success('Procedimento desativado.');
      setOpen(false);
    } else {
      toast.error(result.error ?? 'Erro ao desativar procedimento');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="p-1.5 text-content-secondary hover:text-destructive rounded-md hover:bg-background-secondary transition-colors"
          aria-label="Desativar procedimento"
        >
          <Trash2 className="size-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-background-tertiary rounded-2xl p-6 shadow-2xl border border-border-primary focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-label-large-size text-content-primary font-bold">
              Desativar Procedimento
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

          <p className="text-paragraph-medium-size text-content-secondary mb-6">
            Tem certeza que deseja desativar{' '}
            <span className="text-content-primary font-medium">{nome}</span>? O
            procedimento não será exibido para novos agendamentos.
          </p>

          <div className="flex gap-3 justify-end">
            <Dialog.Close asChild>
              <Button variant="ghost">Cancelar</Button>
            </Dialog.Close>
            <Button
              variant="destructive"
              onClick={handleDesativar}
              disabled={isLoading}
            >
              {isLoading ? 'Desativando...' : 'Desativar'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
