import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Topbar } from "@/components/topbar"
import { getSession } from "@/auth/session"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) redirect("/api/auth/clear-session")

  return (
    <div className="flex flex-1">
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar user={session.user} />
        <main className="flex-1 px-6 pb-8">{children}</main>
      </div>
    </div>
  )
}
