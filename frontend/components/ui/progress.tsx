import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export default function Progress({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600'
  }

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-gray-200',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all duration-300 ease-in-out',
          colorClasses[color]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}