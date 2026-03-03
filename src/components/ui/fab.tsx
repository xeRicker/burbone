import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "small" | "standard" | "large" | "extended";
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ className, variant = "standard", children, ...props }, ref) => {
    const variants = {
      small: "w-10 h-10 rounded-md",
      standard: "w-14 h-14 rounded-lg",
      large: "w-24 h-24 rounded-xl",
      extended: "h-14 px-6 rounded-lg min-w-[80px]",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center bg-primary-container text-on-primary-container elevation-3 hover:elevation-4 active:elevation-2 transition-all duration-200 disabled:opacity-38 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
FAB.displayName = "FAB";

export { FAB };
