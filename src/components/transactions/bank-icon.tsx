import { getBank } from "@/lib/banks"

export function BankIcon({ bank, size = 40 }: { bank: string | null | undefined; size?: number }) {
  const b = getBank(bank)

  if (!b?.logo) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
        style={{ width: size, height: size, backgroundColor: b?.color ?? "#64748b" }}
      >
        {b?.name?.[0] ?? "?"}
      </span>
    )
  }

  return (
    // biome-ignore lint/performance/noImgElement: ícones locais estáticos não precisam de otimização
    <img
      src={b.logo}
      alt={b.name}
      width={size}
      height={size}
      className="shrink-0 rounded-xl"
      style={{ width: size, height: size }}
    />
  )
}
