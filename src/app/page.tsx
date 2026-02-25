import { PeriodSection } from '@/components/ui/period-section';
import { AppointmentForm } from '@/components/ui/appointment-form';
import { listarCompromissos } from '@/actions/listar-compromissos';
import { grupoCompromissosporPeriodo } from '@/lib/compromisso-utils';

export default async function Home() {
  const compromissos = await listarCompromissos();
  const grupos = grupoCompromissosporPeriodo(compromissos);

  return (
    <div className="bg-background-primary p-6">
      <div className="flex items-center justify-between md:m-8 mb-8">
        <div>
          <h1 className="text-title-size text-content-primary mb-2">
            Sua Agenda
          </h1>
          <p className="text-paragraph-medium-size text-content-secondary">
            Aqui você pode ver todos os pacientes e serviços agendados para
            hoje.
          </p>
        </div>
        <AppointmentForm />
      </div>

      <div className="md:mx-8">
        <PeriodSection type="manha" compromissos={grupos.manha} />
        <PeriodSection type="tarde" compromissos={grupos.tarde} />
        <PeriodSection type="noite" compromissos={grupos.noite} />
      </div>
    </div>
  );
}
