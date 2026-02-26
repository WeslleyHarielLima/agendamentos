'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Calendar, Stethoscope, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Agenda', icon: Calendar },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/procedimentos', label: 'Procedimentos', icon: Stethoscope },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-background-secondary border-r border-border-divisor flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-divisor">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-content-brand flex items-center justify-center">
            <Stethoscope className="size-4 text-white" />
          </div>
          <span className="text-label-large-size font-bold text-content-primary">
            Clínica
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-paragraph-medium-size font-medium transition-colors',
                isActive
                  ? 'bg-background-tertiary text-content-brand'
                  : 'text-content-secondary hover:bg-background-tertiary hover:text-content-primary'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
