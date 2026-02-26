'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { Plus, X, Search } from 'lucide-react';

import { criarPaciente } from '@/actions/criar-paciente';
import { atualizarPaciente } from '@/actions/atualizar-paciente';
import {
  pacienteFormSchema,
  type PacienteFormData,
} from '@/lib/schemas/paciente-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/* ── masks ── */

function formatTelefone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length > 7) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 0) return `(${d}`;
  return d;
}

function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length > 9)
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

function formatCEP(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length > 5) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return d;
}

/* ── ViaCEP ── */

async function lookupCEP(cep: string) {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      logradouro: (data.logradouro as string) ?? '',
      bairro: (data.bairro as string) ?? '',
      cidade: (data.localidade as string) ?? '',
      estado: (data.uf as string) ?? '',
    };
  } catch {
    return null;
  }
}

/* ── types ── */

type PacienteData = {
  id: string;
  nome: string;
  cpf?: string | null;
  dataNascimento?: Date | null;
  sexo?: string | null;
  telefone: string;
  email?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  observacoes?: string | null;
};

type PatientFormProps = {
  paciente?: PacienteData;
  onCreated?: (p: {
    id: string;
    nome: string;
    telefone: string;
    email: string | null;
  }) => void;
  children?: React.ReactNode;
};

/* ── helpers ── */

function toDateInput(d?: Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().split('T')[0];
}

function SectionTitle({ label }: { label: string }) {
  return (
    <p className="text-paragraph-small-size text-content-tertiary font-semibold uppercase tracking-wider pt-2 pb-1 border-b border-border-divisor">
      {label}
    </p>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-paragraph-small-size text-destructive">{msg}</p>
  );
}

/* ── component ── */

export function PatientForm({
  paciente,
  onCreated,
  children,
}: PatientFormProps) {
  const [open, setOpen] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const isEdit = !!paciente;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PacienteFormData>({
    resolver: standardSchemaResolver(pacienteFormSchema),
    defaultValues: paciente
      ? {
          nome: paciente.nome,
          cpf: paciente.cpf ?? '',
          dataNascimento: toDateInput(paciente.dataNascimento),
          sexo: (paciente.sexo as PacienteFormData['sexo']) ?? '',
          telefone: paciente.telefone,
          email: paciente.email ?? '',
          cep: paciente.cep ?? '',
          logradouro: paciente.logradouro ?? '',
          numero: paciente.numero ?? '',
          complemento: paciente.complemento ?? '',
          bairro: paciente.bairro ?? '',
          cidade: paciente.cidade ?? '',
          estado: paciente.estado ?? '',
          observacoes: paciente.observacoes ?? '',
        }
      : undefined,
  });

  const handleBuscarCEP = async () => {
    setCepLoading(true);
    const result = await lookupCEP(watch('cep') ?? '');
    if (result) {
      setValue('logradouro', result.logradouro);
      setValue('bairro', result.bairro);
      setValue('cidade', result.cidade);
      setValue('estado', result.estado);
      toast.success('Endereço preenchido!');
    } else {
      toast.error('CEP não encontrado');
    }
    setCepLoading(false);
  };

  const onSubmit = async (formData: PacienteFormData) => {
    const payload = {
      nome: formData.nome,
      cpf: formData.cpf || undefined,
      dataNascimento: formData.dataNascimento || undefined,
      sexo: formData.sexo || undefined,
      telefone: formData.telefone,
      email: formData.email || undefined,
      cep: formData.cep || undefined,
      logradouro: formData.logradouro || undefined,
      numero: formData.numero || undefined,
      complemento: formData.complemento || undefined,
      bairro: formData.bairro || undefined,
      cidade: formData.cidade || undefined,
      estado: formData.estado || undefined,
      observacoes: formData.observacoes || undefined,
    };

    if (isEdit) {
      const result = await atualizarPaciente({ id: paciente.id, ...payload });
      if (result.success) {
        toast.success('Paciente atualizado!');
        setOpen(false);
      } else {
        toast.error(result.error ?? 'Erro ao salvar paciente');
      }
      return;
    }

    const result = await criarPaciente(payload);
    if (result.success) {
      toast.success('Paciente cadastrado!');
      reset();
      onCreated?.(result.data);
      setOpen(false);
    } else {
      toast.error(result.error ?? 'Erro ao salvar paciente');
    }
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

        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-2xl bg-background-tertiary rounded-2xl shadow-2xl border border-border-primary focus:outline-none flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-primary shrink-0">
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

          {/* Form — scrollável */}
          <form
            id="patient-form"
            onSubmit={handleSubmit(onSubmit)}
            className="overflow-y-auto flex-1 px-6 py-5 space-y-5"
          >
            {/* ── Dados Pessoais ── */}
            <SectionTitle label="Dados Pessoais" />

            <div>
              <Label htmlFor="pf-nome">Nome completo *</Label>
              <Input
                id="pf-nome"
                placeholder="Ex: Maria da Silva"
                {...register('nome')}
              />
              <FieldError msg={errors.nome?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pf-cpf">CPF</Label>
                <Input
                  id="pf-cpf"
                  placeholder="000.000.000-00"
                  {...register('cpf')}
                  onChange={(e) => setValue('cpf', formatCPF(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="pf-dn">Data de Nascimento</Label>
                <Input id="pf-dn" type="date" {...register('dataNascimento')} />
              </div>
            </div>

            <div>
              <Label htmlFor="pf-sexo">Sexo</Label>
              <select
                id="pf-sexo"
                {...register('sexo')}
                className="w-full rounded-lg border border-border-primary bg-background-secondary px-3 py-2 text-paragraph-medium-size text-content-primary focus:outline-none focus:ring-1 focus:ring-content-brand"
              >
                <option value="">Não informado</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            {/* ── Contato ── */}
            <SectionTitle label="Contato" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pf-tel">Telefone *</Label>
                <Input
                  id="pf-tel"
                  placeholder="(00) 00000-0000"
                  {...register('telefone')}
                  onChange={(e) =>
                    setValue('telefone', formatTelefone(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                />
                <FieldError msg={errors.telefone?.message} />
              </div>
              <div>
                <Label htmlFor="pf-email">E-mail</Label>
                <Input
                  id="pf-email"
                  type="email"
                  placeholder="Ex: maria@email.com"
                  {...register('email')}
                />
                <FieldError msg={errors.email?.message} />
              </div>
            </div>

            {/* ── Endereço ── */}
            <SectionTitle label="Endereço" />

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="pf-cep">CEP</Label>
                <Input
                  id="pf-cep"
                  placeholder="00000-000"
                  {...register('cep')}
                  onChange={(e) => setValue('cep', formatCEP(e.target.value))}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={handleBuscarCEP}
                disabled={cepLoading}
                className="shrink-0"
              >
                <Search className="size-4" />
                {cepLoading ? 'Buscando...' : 'Buscar CEP'}
              </Button>
            </div>

            <div>
              <Label htmlFor="pf-log">Logradouro</Label>
              <Input
                id="pf-log"
                placeholder="Rua, Av., Travessa..."
                {...register('logradouro')}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pf-num">Número</Label>
                <Input id="pf-num" placeholder="123" {...register('numero')} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="pf-comp">Complemento</Label>
                <Input
                  id="pf-comp"
                  placeholder="Apto, Bloco, Casa..."
                  {...register('complemento')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pf-bairro">Bairro</Label>
              <Input
                id="pf-bairro"
                placeholder="Ex: Centro"
                {...register('bairro')}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <Label htmlFor="pf-cidade">Cidade</Label>
                <Input
                  id="pf-cidade"
                  placeholder="Ex: São Paulo"
                  {...register('cidade')}
                />
              </div>
              <div>
                <Label htmlFor="pf-estado">UF</Label>
                <Input
                  id="pf-estado"
                  placeholder="SP"
                  maxLength={2}
                  {...register('estado')}
                  onChange={(e) =>
                    setValue('estado', e.target.value.toUpperCase())
                  }
                />
                <FieldError msg={errors.estado?.message} />
              </div>
            </div>

            {/* ── Informações Clínicas ── */}
            <SectionTitle label="Informações Clínicas" />

            <div>
              <Label htmlFor="pf-obs">Observações</Label>
              <Textarea
                id="pf-obs"
                placeholder="Alergias, condições de saúde, convênio, notas gerais..."
                rows={3}
                {...register('observacoes')}
              />
            </div>
          </form>

          {/* Footer */}
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-border-primary shrink-0">
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                onClick={() => !isEdit && reset()}
              >
                Cancelar
              </Button>
            </Dialog.Close>
            <Button type="submit" form="patient-form" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : isEdit
                  ? 'Salvar Alterações'
                  : 'Cadastrar Paciente'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
