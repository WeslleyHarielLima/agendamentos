import { PeriodSection } from '@/components/ui/period-section';
import { AppointmentForm } from '@/components/ui/appointment-form';

export default function Home() {
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
      <PeriodSection period={[]} />
    </div>
  );
}
