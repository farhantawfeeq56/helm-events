"use client"

import * as React from "react"
import { Check } from "@phosphor-icons/react"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className="peer h-4 w-4 shrink-0 rounded-sm border border-slate-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-indigo-600 checked:border-indigo-600 appearance-none"
          ref={ref}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <Check
          className="absolute h-3 w-3 text-white pointer-events-none hidden peer-checked:block left-0.5"
          weight="bold"
        />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
