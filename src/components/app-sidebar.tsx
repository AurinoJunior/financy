"use client"

import { ArrowLeftRightIcon, LayoutDashboardIcon, RepeatIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/transacoes", label: "Transações", icon: ArrowLeftRightIcon },
  { href: "/recorrentes", label: "Recorrentes", icon: RepeatIcon },
  { href: "/configuracoes", label: "Configurações", icon: SettingsIcon },
] as const

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col px-3 py-5">
      <Link href="/" aria-label="Financy" className="mb-6 flex items-center gap-3 px-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          F
        </span>
        <span className="font-semibold tracking-tight text-sidebar-foreground">Financy</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-white/80 hover:bg-white/6 hover:text-white",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
