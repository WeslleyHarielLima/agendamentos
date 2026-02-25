import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex w-full rounded-lg border border-border-primary bg-background-secondary px-3 py-2',
        'text-paragraph-medium-size text-content-primary',
        'placeholder:text-content-tertiary',
        'focus:outline-none focus:ring-2 focus:ring-border-brand focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'resize-none transition-colors',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
