"use client"

import { LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"
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

export function Topbar({ user }: { user: TopbarUser }) {
  const router = useRouter()
  const firstName = user.name?.trim().split(/\s+/)[0] ?? "de volta"

  async function handleSignOut() {
    await signOut()
    toast.success("Você saiu da conta")
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5">
      <div>
        <h1 className="text-2xl font-bold leading-tight">Olá, {firstName}!</h1>
        <p className="text-sm text-muted-foreground">para onde vai meu dinheiro?</p>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar>
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Avatar"} />
              <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{user.name ?? "Conta"}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOutIcon />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
