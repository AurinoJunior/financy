"use client"

import { LogOutIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth-client"

type TopbarUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?"
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

const PAGE_HEADERS: Record<string, { title: (name: string) => string; subtitle: string }> = {
  "/": {
    title: (name) => `Olá, ${name}!`,
    subtitle: "Vamos ver para onde seu dinheiro foi?",
  },
  "/transacoes": {
    title: () => "Transações",
    subtitle: "Importe e categorize seus extratos",
  },
  "/recorrentes": {
    title: () => "Contas Recorrentes",
    subtitle: "Seus compromissos e contas fixas do mês",
  },
  "/configuracoes": {
    title: () => "Configurações",
    subtitle: "Gerencie suas categorias e seu planejamento financeiro",
  },
}

export function Topbar({ user }: { user: TopbarUser }) {
  const router = useRouter()
  const pathname = usePathname()
  const firstName = user.name?.trim().split(/\s+/)[0] ?? "você"

  const header = PAGE_HEADERS[pathname] ?? PAGE_HEADERS["/"]
  const title = header.title(firstName)
  const { subtitle } = header

  async function handleSignOut() {
    await signOut()
    toast.success("Você saiu da conta")
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="flex items-center justify-between gap-4 p-8">
      <div>
        <h1 className="text-2xl font-bold leading-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 cursor-pointer rounded-full outline-none ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-ring/40 focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar size="lg">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Avatar"} />
              <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                {initials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{user.name ?? "Conta"}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              v{process.env.NEXT_PUBLIC_APP_VERSION}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut} className="justify-center">
              <LogOutIcon />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
