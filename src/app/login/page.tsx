import { LoginForm } from './login-form';

export const metadata = {
  title: 'Login — Agendamentos',
};

export default function LoginPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-primary">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <h1 className="text-title-size font-bold text-content-primary">
            Agendamentos
          </h1>
          <p className="mt-1 text-paragraph-medium-size text-content-secondary">
            Entre com sua conta para continuar
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
