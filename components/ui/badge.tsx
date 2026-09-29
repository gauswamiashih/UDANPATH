import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  const variants = {
    primary: "bg-primary-light text-primary border-primary/20",
    success: "bg-success-light text-success border-success/20",
    warning: "bg-accent-light text-accent border-accent/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info-light text-info border-info/20",
    neutral: "bg-background-tertiary text-text-muted border-border"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
