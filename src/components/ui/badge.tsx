import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary-subtle text-primary border border-primary-muted/20",
        success: "bg-success-subtle text-success border border-success-border/20",
        warning: "bg-warning-subtle text-warning border border-warning-border/20",
        error: "bg-error-subtle text-error border border-error-border/20",
        info: "bg-info-subtle text-info border border-info-border/20",
        outline: "text-text-primary border border-border-default",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
