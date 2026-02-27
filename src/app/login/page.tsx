import { Stethoscope } from 'lucide-react';
import { LoginForm } from './login-form';

export const metadata = {
  title: 'Login — Agendamentos',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-background-brand">
            <Stethoscope className="size-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-title text-content-primary">Agendamentos</h1>
            <p className="mt-1 text-paragraph-medium text-content-secondary">
              Entre com sua conta para continuar
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-primary bg-background-secondary p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
