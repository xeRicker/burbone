import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-38",
  {
    variants: {
      variant: {
        filled: "bg-primary text-text-on-primary hover:bg-primary-hover",
        tonal: "bg-primary-subtle text-primary hover:bg-hover-overlay",
        outlined: "border border-border-default text-primary hover:bg-hover-overlay",
        text: "text-primary hover:bg-hover-overlay",
        ghost: "text-text-secondary hover:bg-hover-overlay",
        error: "bg-error text-text-on-error hover:bg-error-hover",
        success: "bg-success text-text-on-success hover:bg-success-hover",
        warning: "bg-warning text-text-on-warning hover:bg-warning-hover",
        info: "bg-info text-text-on-info hover:bg-info-hover",
        primary: "bg-primary text-text-on-primary hover:bg-primary-hover",
        secondary: "bg-bg-elevated text-text-primary hover:bg-hover-overlay",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
