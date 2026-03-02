import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-38",
  {
    variants: {
      variant: {
        filled: "bg-primary text-text-on-primary hover:bg-primary-hover",
        tonal: "bg-primary-subtle text-primary hover:bg-hover-overlay",
        outlined: "border border-border-default text-primary hover:bg-hover-overlay",
        ghost: "text-text-secondary hover:bg-hover-overlay",
        error: "bg-error text-text-on-error hover:bg-error-hover",
        primary: "bg-primary text-text-on-primary hover:bg-primary-hover",
        secondary: "bg-bg-elevated text-text-primary hover:bg-hover-overlay",
      },
      size: {
        default: "h-10 w-10",
        sm: "h-9 w-9",
        lg: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  icon?: LucideIcon;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon: Icon, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {Icon ? <Icon className="w-5 h-5" /> : children}
      </Comp>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
