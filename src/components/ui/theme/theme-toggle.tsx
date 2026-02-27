'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle({ iconOnly = false }: { iconOnly?: boolean }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === 'light';

  if (iconOnly) {
    return (
      <button
        onClick={toggle}
        aria-label={
          isLight ? 'Mudar para modo escuro' : 'Mudar para modo claro'
        }
        className="flex items-center justify-center w-full h-10 rounded-lg transition-colors hover:bg-background-tertiary text-content-secondary hover:text-content-primary"
      >
        {isLight ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
      className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors hover:bg-background-tertiary"
    >
      {/* Ícone do modo atual */}
      <div className="flex items-center justify-center size-4 shrink-0">
        {isLight ? (
          <Sun className="size-4 text-content-secondary group-hover:text-content-primary transition-colors" />
        ) : (
          <Moon className="size-4 text-content-secondary group-hover:text-content-primary transition-colors" />
        )}
      </div>

      {/* Label */}
      <span className="text-paragraph-medium-size text-content-secondary group-hover:text-content-primary transition-colors flex-1 text-left">
        {isLight ? 'Modo claro' : 'Modo escuro'}
      </span>

      {/* Pill toggle */}
      <div
        className="relative w-10 h-5 rounded-full shrink-0 transition-colors duration-200"
        style={{
          backgroundColor: isLight
            ? 'var(--color-content-brand)'
            : 'var(--color-border-primary)',
        }}
      >
        <span
          className="absolute top-0.5 size-4 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-300"
          style={{
            left: isLight ? 'calc(100% - 18px)' : '2px',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {isLight ? (
            <Sun className="size-2.5 text-amber-500" />
          ) : (
            <Moon className="size-2.5 text-slate-400" />
          )}
        </span>
      </div>
    </button>
  );
}
