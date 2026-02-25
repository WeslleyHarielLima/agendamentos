import { User, Stethoscope, Phone, Clock } from 'lucide-react';
import type { Compromisso } from '@/lib/compromisso-utils';

type AppointmentCardProps = {
  compromisso: Compromisso;
};

function formatHora(data: Date): string {
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatTelefoneDisplay(telefone: string): string {
  return telefone;
}

export function AppointmentCard({ compromisso }: AppointmentCardProps) {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-border-divisor last:border-b-0 hover:bg-background-secondary transition-colors">
      {/* Horário */}
      <div className="flex items-center gap-1.5 min-w-[56px] pt-0.5">
        <Clock className="size-3.5 text-content-tertiary shrink-0" />
        <span className="text-label-small-size text-content-tertiary">
          {formatHora(compromisso.dataMarcacao)}
        </span>
      </div>

      {/* Divider vertical */}
      <div className="w-px self-stretch bg-border-divisor shrink-0" />

      {/* Conteúdo */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <User className="size-3.5 text-content-brand shrink-0" />
          <span className="text-label-medium-size text-content-primary truncate">
            {compromisso.pacienteNome}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Stethoscope className="size-3.5 text-content-secondary shrink-0" />
          <span className="text-paragraph-medium-size text-content-secondary truncate">
            {compromisso.procedimento}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="size-3.5 text-content-tertiary shrink-0" />
          <span className="text-paragraph-small-size text-content-tertiary">
            {formatTelefoneDisplay(compromisso.telefone)}
          </span>
        </div>
      </div>
    </div>
  );
}
