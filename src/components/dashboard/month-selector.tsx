"use client"

import { ChevronDownIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function formatMonthLong(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number)
  const d = new Date(year, month - 1, 1)
  return `${d.toLocaleDateString("pt-BR", { month: "long" })} ${d.getFullYear()}`
}

function formatMonthShort(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number)
  const d = new Date(year, month - 1, 1)
  return `${d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")} ${d.getFullYear()}`
}

export function MonthSelector({
  availableMonths,
  currentMonth,
}: {
  availableMonths: string[]
  currentMonth: string
}) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm capitalize text-white shadow-[0_4px_16px_oklch(0_0_0/0.3),inset_0_1px_0_oklch(1_0_0/0.07)] backdrop-blur-xl outline-none">
        {formatMonthLong(currentMonth)}
        <ChevronDownIcon className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {availableMonths.map((m) => {
          const active = m === currentMonth
          return (
            <DropdownMenuItem
              key={m}
              onClick={() => router.push(active ? "/" : `/?month=${m}`)}
              className={cn("capitalize", active && "text-primary")}
            >
              {formatMonthShort(m)}
              {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
