import * as React from 'react';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'block mb-1.5 text-label-medium-size text-content-secondary',
        className
      )}
      {...props}
    />
  );
}

export { Label };
