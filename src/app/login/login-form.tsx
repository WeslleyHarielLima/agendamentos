'use client';

import { useState, useTransition } from 'react';
import { login } from '@/actions/login';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-paragraph-medium-size text-content-secondary"
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
          className="rounded-md border border-border-default bg-background-secondary px-3 py-2 text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          placeholder="seu@email.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="senha"
          className="text-paragraph-medium-size text-content-secondary"
        >
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          disabled={isPending}
          className="rounded-md border border-border-default bg-background-secondary px-3 py-2 text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-md bg-accent px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
