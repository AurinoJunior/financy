import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
            F
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Financy</h1>
            <p className="text-sm text-muted-foreground">para onde vai meu dinheiro?</p>
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Fase 0 — fundação no ar. Next.js + Tailwind v4 + shadcn/ui + Biome + Drizzle + Postgres.
        </p>

        <div className="flex gap-3">
          <Button>Acento verde</Button>
          <Button variant="secondary">Secundário</Button>
        </div>
      </div>
    </main>
  )
}
