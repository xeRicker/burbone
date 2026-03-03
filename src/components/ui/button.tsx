import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tonal" | "outlined" | "text" | "elevated";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", ...props }, ref) => {
    const variants = {
      filled: "bg-primary text-on-primary hover:elevation-2 active:elevation-1",
      tonal: "bg-primary-container text-on-primary-container hover:elevation-2",
      outlined: "border border-border-default text-primary hover:bg-hover-overlay",
      text: "text-primary hover:bg-hover-overlay",
      elevated: "bg-bg-elevated text-primary elevation-1 hover:elevation-2",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-6 h-10 label-large transition-all duration-200 disabled:opacity-38 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
