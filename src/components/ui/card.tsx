import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "filled" | "outlined";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "filled", ...props }, ref) => {
    const variants = {
      elevated: "bg-bg-raised elevation-1 hover:elevation-2",
      filled: "bg-bg-elevated",
      outlined: "bg-bg-raised border border-border-subtle",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
