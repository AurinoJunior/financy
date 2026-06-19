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
    <aside className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-sidebar-border bg-sidebar py-4">
      <Link
        href="/"
        aria-label="Financy"
        className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground"
      >
        F
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={cn(
                "flex size-10 items-center justify-center rounded-xl text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                active && "bg-sidebar-accent text-primary",
              )}
            >
              <Icon className="size-5" />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
