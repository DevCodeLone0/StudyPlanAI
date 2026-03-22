import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    danger: 'bg-danger-50 text-danger-700',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }
  
  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-lg',
  }
  
  // Color based on level ranges
  const getLevelColor = (lvl: number) => {
    if (lvl >= 20) return 'bg-gradient-to-br from-amber-400 to-yellow-600' // Gold
    if (lvl >= 10) return 'bg-gradient-to-br from-gray-300 to-gray-500' // Silver
    if (lvl >= 5) return 'bg-gradient-to-br from-amber-600 to-amber-800' // Bronze
    return 'bg-gradient-to-br from-primary-400 to-primary-600' // Default blue
  }
  
  return (
    <div className={clsx(
      'rounded-full flex items-center justify-center font-bold text-white shadow-md',
      getLevelColor(level),
      sizes[size],
      className
    )}>
      {level}
    </div>
  )
}
