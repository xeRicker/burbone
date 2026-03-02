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
        className={`glass-effect rounded-[20px] p-6 ${
          interactive ? "hover:translate-y-[-1px] hover:brightness-105 transition-all duration-300 cursor-pointer" : ""
        } ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
GlassPanel.displayName = "GlassPanel"
