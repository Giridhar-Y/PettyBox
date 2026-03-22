import React from 'react';
import { cn } from '../layout/Sidebar';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'magic';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';
    
    const variants = {
      primary: 'bg-black text-white hover:bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-transparent',
      outline: 'bg-white text-zinc-800 border-zinc-200 shadow-sm hover:bg-zinc-50 border hover-float',
      ghost: 'bg-transparent hover:bg-zinc-100 text-zinc-700',
      danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
      magic: 'magic-border text-zinc-800 shadow-sm hover-float',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-[13px] rounded-md',
      md: 'h-9 px-4 text-sm rounded-lg',
      lg: 'h-11 px-6 text-base rounded-xl',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
