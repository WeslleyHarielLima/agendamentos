import { Sun, Cloudy, Moon } from 'lucide-react';
import type { Compromisso, PeriodoKey } from '@/lib/compromisso-utils';
import { AppointmentCard } from '@/components/ui/appointment-card';

type PeriodConfig = {
  type: PeriodoKey;
  title: string;
  icon: React.ReactNode;
};

const PERIODOS: PeriodConfig[] = [
  {
    type: 'manha',
    title: 'Manhã',
    icon: <Sun className="size-4 text-accent-blue" />,
  },
  {
    type: 'tarde',
    title: 'Tarde',
    icon: <Cloudy className="size-4 text-accent-orange" />,
  },
  {
    type: 'noite',
    title: 'Noite',
    icon: <Moon className="size-4 text-accent-yellow" />,
  },
];

type PeriodSectionProps = {
  type: PeriodoKey;
  compromissos: Compromisso[];
};

export function PeriodSection({ type, compromissos }: PeriodSectionProps) {
  const config = PERIODOS.find((p) => p.type === type)!;

  return (
    <section className="mb-4 bg-background-tertiary rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border-divisor">
        {config.icon}
        <h2 className="text-label-large-size text-content-primary">
          {config.title}
        </h2>
        <span className="ml-auto text-label-small-size text-content-tertiary">
          {compromissos.length}{' '}
          {compromissos.length === 1 ? 'agendamento' : 'agendamentos'}
        </span>
      </div>

      {/* Lista de cards */}
      {compromissos.length === 0 ? (
        <p className="px-5 py-6 text-paragraph-medium-size text-content-tertiary text-center">
          Nenhum agendamento neste período.
        </p>
      ) : (
        <div>
          {compromissos.map((compromisso) => (
            <AppointmentCard key={compromisso.id} compromisso={compromisso} />
          ))}
        </div>
      )}
    </section>
  );
}
