import { Users } from 'lucide-react';

import { listarPacientes } from '@/actions/listar-pacientes';
import { PatientForm } from '@/components/ui/patient-form';
import { PacientesList } from './pacientes-list';

export default async function PacientesPage() {
  const pacientes = await listarPacientes();

  return (
    <div className="bg-background-primary p-6">
      <div className="flex items-center justify-between md:m-8 mb-8">
        <div>
          <h1 className="text-title-size text-content-primary mb-2">
            Pacientes
          </h1>
          <p className="text-paragraph-medium-size text-content-secondary">
            {pacientes.length === 0
              ? 'Nenhum paciente cadastrado.'
              : `${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''} cadastrado${pacientes.length !== 1 ? 's' : ''}.`}
          </p>
        </div>
        <PatientForm />
      </div>

      {pacientes.length === 0 ? (
        <div className="md:mx-8 flex flex-col items-center justify-center py-24 gap-4">
          <Users className="size-12 text-content-tertiary" />
          <p className="text-paragraph-medium-size text-content-tertiary">
            Nenhum paciente cadastrado ainda.
          </p>
          <PatientForm />
        </div>
      ) : (
        <div className="md:mx-8">
          <PacientesList pacientes={pacientes} />
        </div>
      )}
    </div>
  );
}
