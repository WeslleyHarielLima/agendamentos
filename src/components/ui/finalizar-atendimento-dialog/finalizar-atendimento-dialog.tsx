'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { CheckCircle, X } from 'lucide-react';

import { finalizarAtendimento } from '@/actions/finalizar-atendimento';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type FinalizarAtendimentoDialogProps = {
  compromisso: {
    id: string;
    pacienteNome: string;
    procedimento: string;
    dataMarcacao: Date | string;
    procedimentoRel: { valor: number } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function FinalizarAtendimentoDialog({
  compromisso,
  open,
  onOpenChange,
}: FinalizarAtendimentoDialogProps) {
  const valorPadrao = compromisso.procedimentoRel?.valor ?? 0;
  const [valor, setValor] = useState(String(valorPadrao));
  const [observacao, setObservacao] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirmar = async () => {
    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    setIsSaving(true);
    const result = await finalizarAtendimento({
      id: compromisso.id,
      valorCobrado: valorNum,
      observacao: observacao || undefined,
    });

    if (result.success) {
      toast.success('Atendimento finalizado com sucesso!');
      onOpenChange(false);
    } else {
      toast.error(result.error ?? 'Erro ao finalizar atendimento');
      setIsSaving(false);
    }
  };

  const data = toDate(compromisso.dataMarcacao);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background-tertiary rounded-2xl p-6 shadow-2xl border border-border-primary focus:outline-none">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-label-large-size text-content-primary font-bold">
              Finalizar Atendimento
            </Dialog.Title>
            <button
              className="text-content-secondary hover:text-content-primary transition-colors rounded-md p-1 hover:bg-background-secondary"
              aria-label="Fechar"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Resumo do atendimento */}
          <div className="bg-background-secondary border border-border-primary rounded-xl p-4 mb-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-paragraph-small-size text-content-tertiary">
                Paciente
              </span>
              <span className="text-paragraph-medium-size text-content-primary font-medium">
                {compromisso.pacienteNome}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-paragraph-small-size text-content-tertiary">
                Procedimento
              </span>
              <span className="text-paragraph-medium-size text-content-secondary">
                {compromisso.procedimento}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-paragraph-small-size text-content-tertiary">
                Data
              </span>
              <span className="text-paragraph-medium-size text-content-secondary">
                {data.toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="valorCobrado">Valor Cobrado (R$)</Label>
              <Input
                id="valorCobrado"
                type="number"
                step="0.01"
                min="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0.00"
              />
              {valorPadrao > 0 && (
                <p className="mt-1 text-paragraph-small-size text-content-tertiary">
                  Valor padrão do procedimento:{' '}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(valorPadrao)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="observacaoAtendimento">
                Observação (opcional)
              </Label>
              <Textarea
                id="observacaoAtendimento"
                placeholder="Anotações sobre o atendimento..."
                rows={3}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-5">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmar} disabled={isSaving}>
              <CheckCircle className="size-4" />
              {isSaving ? 'Salvando...' : 'Confirmar e Gerar Recibo'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
