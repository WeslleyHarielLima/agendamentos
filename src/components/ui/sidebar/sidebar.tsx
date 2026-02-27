'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme/theme-toggle';
import { useSidebar } from './sidebar-context';

const navLinks = [
  { href: '/', label: 'Agenda', icon: Calendar },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/procedimentos', label: 'Procedimentos', icon: Stethoscope },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobileOpen, setMobileOpen } =
    useSidebar();

  return (
    <>
      {/* Backdrop mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'bg-background-secondary border-r border-border-divisor flex flex-col transition-all duration-300',
          // Mobile: overlay fixo fora do fluxo
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-30 max-md:w-60',
          isMobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          // Desktop: dentro do fluxo, largura varia
          'md:shrink-0 md:translate-x-0',
          isCollapsed ? 'md:w-17' : 'md:w-60'
        )}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-border-divisor flex items-center justify-between min-h-17">
          <div
            className={cn(
              'flex items-center gap-2.5 min-w-0',
              isCollapsed && 'md:hidden'
            )}
          >
            <div className="size-8 rounded-lg bg-content-brand flex items-center justify-center shrink-0">
              <Stethoscope className="size-4 text-white" />
            </div>
            <span className="text-label-large-size font-bold text-content-primary truncate">
              Clínica
            </span>
          </div>

          {/* Ícone isolado no modo colapsado (desktop) */}
          {isCollapsed && (
            <div className="hidden md:flex size-8 rounded-lg bg-content-brand items-center justify-center mx-auto">
              <Stethoscope className="size-4 text-white" />
            </div>
          )}

          {/* Fechar (mobile) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-content-secondary hover:text-content-primary transition-colors"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>

          {/* Toggle colapso (desktop) */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              'hidden md:flex items-center justify-center size-6 rounded-md hover:bg-background-tertiary text-content-secondary hover:text-content-primary transition-colors shrink-0',
              isCollapsed && 'mx-auto'
            )}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-paragraph-medium-size font-medium transition-colors',
                  isActive
                    ? 'bg-background-tertiary text-content-brand'
                    : 'text-content-secondary hover:bg-background-tertiary hover:text-content-primary',
                  isCollapsed && 'md:justify-center md:px-2'
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className={cn(isCollapsed && 'md:hidden')}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tema */}
        <div className="px-3 pb-4 border-t border-border-divisor pt-3">
          <ThemeToggle iconOnly={isCollapsed} />
        </div>
      </aside>
    </>
  );
}
