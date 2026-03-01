"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "motion/react"
import { LucideIcon } from "lucide-react"

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "icon"
  size?: "sm" | "md" | "lg" | "icon"
  icon?: LucideIcon
  children?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", icon: Icon, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-heading tracking-wide uppercase transition-all duration-200"
    
    const variants = {
      primary: "bg-primary text-white shadow-[0_4px_15px_rgba(211,84,0,0.4)] hover:brightness-110",
      secondary: "bg-surface-active text-text-primary border border-[#333] hover:bg-[#333]",
      danger: "bg-danger/10 text-danger border border-danger hover:bg-danger/20",
      ghost: "bg-transparent text-primary hover:text-white",
      icon: "bg-surface border border-[#333] text-text-primary hover:text-primary",
    }
    
    const sizes = {
      sm: "px-4 py-2 text-sm rounded-pill",
      md: "px-6 py-3 text-base rounded-pill",
      lg: "px-8 py-4 text-lg rounded-pill font-semibold",
      icon: "w-14 h-14 rounded-full",
    }
    
    const variantStyle = variants[variant]
    const sizeStyle = sizes[size]
    
    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
        whileTap={{ scale: 0.96 }}
        {...props}
      >
        {Icon && <Icon className={children ? "mr-2 h-5 w-5" : "h-6 w-6"} strokeWidth={1.5} />}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"
