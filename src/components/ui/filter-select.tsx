"use client"

import { ChevronDownIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/utils/cn"

export type FilterOption = { value: string; label: string }

export function FilterSelect({
  value,
  onChange,
  options,
  triggerLabel,
  align = "start",
  contentClassName,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  triggerLabel?: string
  align?: "start" | "end"
  contentClassName?: string
  className?: string
}) {
  const selected = options.find((o) => o.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "glass-blur flex cursor-pointer items-center justify-between gap-1.5 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-white shadow-[0_4px_16px_oklch(0_0_0/0.3),inset_0_1px_0_oklch(1_0_0/0.07)] outline-none",
          className,
        )}
      >
        {triggerLabel ?? selected?.label ?? value}
        <ChevronDownIcon className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("min-w-44", contentClassName)}>
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(value === o.value && "text-primary")}
          >
            {o.label}
            {value === o.value && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
