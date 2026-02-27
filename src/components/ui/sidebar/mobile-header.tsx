'use client';

import { Menu, Stethoscope } from 'lucide-react';
import { useSidebar } from './sidebar-context';

export function MobileHeader() {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-10 h-14 bg-background-secondary border-b border-border-divisor flex items-center px-4 gap-3">
      <button
        onClick={() => setMobileOpen(true)}
        className="text-content-secondary hover:text-content-primary transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-content-brand flex items-center justify-center">
          <Stethoscope className="size-3.5 text-white" />
        </div>
        <span className="text-label-large-size font-bold text-content-primary">
          Clínica
        </span>
      </div>
    </header>
  );
}
