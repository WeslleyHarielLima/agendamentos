'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '@/actions/login';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      senha: formData.get('senha') as string,
    };

    setError(null);
    startTransition(async () => {
      const result = await login(data);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const inputClass =
    'w-full rounded-lg border border-border-primary bg-background-primary px-3 py-2.5 text-paragraph-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-border-brand focus:outline-none disabled:opacity-50';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-label-small text-content-secondary"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isPending}
          className={inputClass}
          placeholder="seu@email.com"
        />
      </div>

      {/* Senha */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="senha"
          className="text-label-small text-content-secondary"
        >
          Senha
        </label>
        <div className="relative">
          <input
            id="senha"
            name="senha"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            disabled={isPending}
            className={`${inputClass} pr-10`}
            placeholder="••••••••"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary transition-colors hover:text-content-secondary"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
          <p className="text-paragraph-small text-red-400">{error}</p>
        </div>
      )}

      {/* Botão */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-background-brand px-4 py-2.5 text-label-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? (
          'Entrando…'
        ) : (
          <>
            <LogIn className="size-4" />
            Entrar
          </>
        )}
      </button>
    </form>
  );
}
