'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from 'radix-ui';

import { deletarPaciente } from '@/actions/deletar-paciente';
import { PatientForm } from '@/components/ui/patient-form';
import { SwipeableRow } from '@/components/ui/swipeable-row';
import { Button } from '@/components/ui/button';

type Paciente = {
  id: string;
  nome: string;
  cpf: string | null;
  dataNascimento: Date | null;
  sexo: string | null;
  telefone: string;
  email: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
  criadoEm: Date;
};

type PacientesListProps = {
  pacientes: Paciente[];
};

function DeletePacienteButton({
  paciente,
  children,
}: {
  paciente: Paciente;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletarPaciente(paciente.id);
    if (result.success) {
      toast.success('Paciente excluído com sucesso!');
      setOpen(false);
    } else {
      toast.error(result.error ?? 'Erro ao excluir paciente');
      setIsDeleting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {children ?? (
          <button
            className="p-1.5 text-content-tertiary hover:text-destructive rounded-md hover:bg-background-secondary transition-colors"
            aria-label="Excluir paciente"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-background-tertiary rounded-2xl p-6 shadow-2xl border border-border-primary focus:outline-none">
          <Dialog.Title className="text-label-large-size text-content-primary font-bold mb-2">
            Excluir Paciente
          </Dialog.Title>
          <Dialog.Description className="text-paragraph-medium-size text-content-secondary mb-6">
            Tem certeza que deseja excluir{' '}
            <span className="text-content-primary font-medium">
              {paciente.nome}
            </span>
            ? Esta ação não pode ser desfeita.
          </Dialog.Description>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
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
  );
}

export function PacientesList({ pacientes }: PacientesListProps) {
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filtered = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(q) ||
      p.telefone.includes(search) ||
      (p.cpf?.includes(search) ?? false) ||
      (p.email?.toLowerCase().includes(q) ?? false) ||
      (p.cidade?.toLowerCase().includes(q) ?? false)
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 bg-background-secondary border border-border-primary rounded-lg">
        <Search className="size-4 text-content-tertiary shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone, CPF, e-mail ou cidade..."
          className="flex-1 bg-transparent text-paragraph-medium-size text-content-primary placeholder:text-content-tertiary focus:outline-none"
        />
      </div>

      {/* List */}
      <div className="bg-background-secondary border border-border-primary rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-paragraph-medium-size text-content-tertiary text-center">
            Nenhum paciente encontrado.
          </p>
        ) : (
          filtered.map((paciente) => {
            const localidade = [paciente.cidade, paciente.estado]
              .filter(Boolean)
              .join('/');
            const subInfo = [
              paciente.cpf,
              paciente.telefone,
              paciente.email,
              localidade || null,
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <SwipeableRow
                key={paciente.id}
                actionsWidth={128}
                className="border-b border-border-divisor last:border-b-0"
                renderActions={(close) => (
                  <div className="flex items-stretch w-full h-full">
                    <PatientForm paciente={paciente}>
                      <button
                        onClick={close}
                        className="flex-1 bg-content-brand active:opacity-80 flex flex-col items-center justify-center gap-1 text-white"
                        aria-label="Editar paciente"
                      >
                        <Pencil className="size-5" />
                        <span className="text-xs font-medium">Editar</span>
                      </button>
                    </PatientForm>
                    <DeletePacienteButton paciente={paciente}>
                      <button
                        className="flex-1 bg-red-600 active:bg-red-700 border-l border-red-700 flex flex-col items-center justify-center gap-1 text-white w-full h-full"
                        aria-label="Excluir paciente"
                      >
                        <Trash2 className="size-5" />
                        <span className="text-xs font-medium">Excluir</span>
                      </button>
                    </DeletePacienteButton>
                  </div>
                )}
              >
                <div className="flex items-center gap-4 px-5 py-4 bg-background-secondary hover:bg-background-primary transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-label-medium-size text-content-primary truncate">
                      {paciente.nome}
                    </p>
                    <p className="text-paragraph-small-size text-content-tertiary truncate">
                      {subInfo}
                    </p>
                  </div>

                  {/* Botões de ação — somente desktop, visíveis ao hover */}
                  <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PatientForm paciente={paciente}>
                      <button
                        className="p-1.5 text-content-secondary hover:text-content-primary rounded-md hover:bg-background-primary transition-colors"
                        aria-label="Editar paciente"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </PatientForm>
                    <DeletePacienteButton paciente={paciente} />
                  </div>

                  <Link
                    href={`/pacientes/${paciente.id}`}
                    className="p-1.5 text-content-tertiary hover:text-content-primary rounded-md hover:bg-background-primary transition-colors shrink-0"
                    aria-label="Ver histórico"
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </SwipeableRow>
            );
          })
        )}
      </div>
    </div>
  );
}
