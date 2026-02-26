'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Paciente = { id: string; nome: string };

type PatientSelectProps = {
  pacientes: Paciente[];
  pacienteIdAtual: string;
};

export function PatientSelect({
  pacientes,
  pacienteIdAtual,
}: PatientSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('pacienteId', e.target.value);
    } else {
      params.delete('pacienteId');
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <select
      value={pacienteIdAtual}
      onChange={handleChange}
      className="bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-paragraph-medium-size text-content-primary focus:outline-none focus:ring-1 focus:ring-content-brand"
    >
      <option value="">Selecione um paciente...</option>
      {pacientes.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nome}
        </option>
      ))}
    </select>
  );
}
