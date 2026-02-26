'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const OPCOES = [
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: '90 dias', value: '90' },
  { label: '1 ano', value: '365' },
];

type PeriodFilterProps = {
  periodoAtual: string;
};

export function PeriodFilter({ periodoAtual }: PeriodFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('periodo', value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 bg-background-secondary rounded-lg p-1 border border-border-primary">
      {OPCOES.map((op) => (
        <button
          key={op.value}
          onClick={() => handleChange(op.value)}
          className={`px-3 py-1.5 rounded-md text-paragraph-small-size font-medium transition-colors cursor-pointer ${
            periodoAtual === op.value
              ? 'bg-content-brand text-white'
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
