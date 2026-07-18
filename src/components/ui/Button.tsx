import { cn } from '@/lib/utils'
import { Loader2, type LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'blue' | 'blueOutline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: LucideIcon
}

export function Button({
  className, variant = 'primary', size = 'md', loading, icon: Icon, children, disabled, ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20',
    secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    outline: 'border-2 border-brand-200 text-brand-700 hover:bg-brand-50',
    ghost: 'text-brand-700 hover:bg-brand-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm shadow-accent-500/20',
    blue: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 focus:ring-blue-500/40',
    blueOutline: 'border-2 border-blue-300 text-blue-700 hover:bg-blue-50 focus:ring-blue-500/40',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}
