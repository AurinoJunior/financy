export const DEFAULTS = { essentialPct: 50, nonEssentialPct: 30, patrimonyPct: 20 } as const

export const GROUPS = [
  { key: "essentialPct" as const, label: "Essencial", color: "text-primary" },
  { key: "nonEssentialPct" as const, label: "Não essencial", color: "text-orange-400" },
  { key: "patrimonyPct" as const, label: "Patrimônio", color: "text-emerald-400" },
] as const

export type GroupKey = (typeof GROUPS)[number]["key"]
