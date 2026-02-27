import { PeriodSection } from '@/components/ui/period-section';
import { AppointmentForm } from '@/components/ui/appointment-form';
import { Calendar } from '@/components/ui/calendar/calendar';
import { listarCompromissos } from '@/actions/listar-compromissos';
import { listarPacientes } from '@/actions/listar-pacientes';
import { listarProcedimentos } from '@/actions/listar-procedimentos';
import { listarDiasComAgendamentos } from '@/actions/listar-dias-com-agendamentos';
import { grupoCompromissosporPeriodo } from '@/lib/compromisso-utils';

function getTodayStr() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function formatDataExibicao(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type SearchParams = Promise<{ data?: string; mes?: string }>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const todayStr = getTodayStr();
  const dataSelecionada = params.data ?? todayStr;
  const mes = params.mes ?? dataSelecionada.slice(0, 7);

  const [compromissos, pacientes, procedimentos, diasComAgendamento] =
    await Promise.all([
      listarCompromissos({ data: dataSelecionada }),
      listarPacientes(),
      listarProcedimentos(),
      listarDiasComAgendamentos(mes),
    ]);

  const grupos = grupoCompromissosporPeriodo(compromissos);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-background-primary min-h-screen">
      {/* Calendário */}
      <div className="w-full md:w-72 md:shrink-0">
        <Calendar
          mes={mes}
          dataSelecionada={dataSelecionada}
          diasComAgendamento={new Set(diasComAgendamento)}
        />
      </div>

      {/* Agenda filtrada */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-title-size text-content-primary mb-1">
              Sua Agenda
            </h1>
            <p className="text-paragraph-medium-size text-content-secondary capitalize">
              {formatDataExibicao(dataSelecionada)}
            </p>
          </div>
          <AppointmentForm
            pacientes={pacientes}
            procedimentos={procedimentos}
          />
        </div>

        <PeriodSection type="manha" compromissos={grupos.manha} />
        <PeriodSection type="tarde" compromissos={grupos.tarde} />
        <PeriodSection type="noite" compromissos={grupos.noite} />
      </div>
    </div>
  );
}
