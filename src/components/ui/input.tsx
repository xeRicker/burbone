import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, icon, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-xs font-bold text-text-secondary uppercase font-heading">
            {label}
          </label>
        )}
        <div className={`flex items-center bg-bg rounded-sm px-4 py-1 border border-[#333] transition-colors focus-within:border-primary ${error ? "border-danger" : ""}`}>
          {icon && <span className="text-text-muted font-bold text-lg mr-2">{icon}</span>}
          <input
            ref={ref}
            className={`w-full bg-transparent border-none text-text-primary text-xl font-medium py-3 text-right focus:outline-none ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    )
  }
)
Input.displayName = "Input"
