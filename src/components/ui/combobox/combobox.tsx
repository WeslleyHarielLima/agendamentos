'use client';

import { useState, useRef, useEffect } from 'react';
import { Popover } from 'radix-ui';
import { Check, ChevronDown, Search } from 'lucide-react';

export type ComboboxItem = {
  id: string;
  label: string;
  sublabel?: string;
};

type ComboboxProps = {
  items: ComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  footer?: React.ReactNode;
  error?: boolean;
};

export function Combobox({
  items,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado encontrado.',
  footer,
  error,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = items.find((item) => item.id === value);

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      (item.sublabel?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [open]);

  const handleSelect = (id: string) => {
    onValueChange(id);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={[
            'w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2',
            'bg-background-secondary border text-paragraph-medium-size text-left',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-border-brand',
            error
              ? 'border-destructive focus:ring-destructive'
              : 'border-border-primary hover:border-border-secondary',
            selected ? 'text-content-primary' : 'text-content-tertiary',
          ].join(' ')}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="size-4 text-content-tertiary shrink-0" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-[var(--radix-popover-trigger-width)] bg-background-tertiary border border-border-primary rounded-xl shadow-2xl overflow-hidden"
          sideOffset={4}
          align="start"
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border-divisor">
            <Search className="size-3.5 text-content-tertiary shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-paragraph-medium-size text-content-primary placeholder:text-content-tertiary focus:outline-none"
            />
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-paragraph-small-size text-content-tertiary text-center">
                {emptyMessage}
              </p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-background-secondary transition-colors"
                >
                  <Check
                    className={[
                      'size-3.5 shrink-0 transition-opacity',
                      value === item.id
                        ? 'text-content-brand opacity-100'
                        : 'opacity-0',
                    ].join(' ')}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-paragraph-medium-size text-content-primary truncate">
                      {item.label}
                    </p>
                    {item.sublabel && (
                      <p className="text-paragraph-small-size text-content-tertiary truncate">
                        {item.sublabel}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-border-divisor">{footer}</div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
