import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const cards = [
  { title: "Total gasto", hint: "no período", value: "R$ —" },
  { title: "Contas recorrentes", hint: "este mês", value: "R$ —" },
  { title: "Sem categoria", hint: "aguardando IA", value: "—" },
]

export default function DashboardPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl">{card.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{card.hint}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="sm:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Dashboard em construção</CardTitle>
          <CardDescription>
            Os gráficos e o resumo de "para onde vai meu dinheiro" chegam na Fase 6, depois que
            transações (Fase 3) e categorização por IA (Fase 4) estiverem prontas.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
