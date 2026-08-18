import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'a1' | 'a2' | 'b1' | 'b2' | 'accent';
}

const badgeVariants: Record<string, string> = {
  default: 'border-transparent bg-primary text-white',
  secondary: 'border-transparent bg-muted text-foreground',
  destructive: 'border-transparent bg-red-500 text-white',
  outline: 'text-foreground border-border',
  accent: 'border-transparent bg-accent text-white',
  a1: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold',
  a2: 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold',
  b1: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold',
  b2: 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  );
}
