"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "motion/react"

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  interactive?: boolean
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className = "", interactive = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`glass-effect rounded-md p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] ${
          interactive ? "hover:translate-y-[-1px] hover:brightness-110 transition-all duration-200 cursor-pointer" : ""
        } ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
GlassPanel.displayName = "GlassPanel"
