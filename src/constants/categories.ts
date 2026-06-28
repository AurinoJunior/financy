import {
  ArrowLeftRightIcon,
  BanknoteIcon,
  BriefcaseIcon,
  BusIcon,
  CarIcon,
  CreditCardIcon,
  DumbbellIcon,
  Gamepad2Icon,
  GiftIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HomeIcon,
  type LucideIcon,
  MoreHorizontalIcon,
  PiggyBankIcon,
  PlaneIcon,
  ReceiptIcon,
  RepeatIcon,
  ShirtIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SmartphoneIcon,
  SparklesIcon,
  UtensilsCrossedIcon,
  WifiIcon,
} from "lucide-react"

export const CATEGORY_TYPES = ["essential", "non_essential", "income"] as const
export type CategoryType = (typeof CATEGORY_TYPES)[number]

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  essential: "Essencial",
  non_essential: "Não essencial",
  income: "Receita & Patrimônio",
}

// Set curado de ícones (a chave string é o que vai pro banco).
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  home: HomeIcon,
  cart: ShoppingCartIcon,
  car: CarIcon,
  bus: BusIcon,
  health: HeartPulseIcon,
  receipt: ReceiptIcon,
  education: GraduationCapIcon,
  food: UtensilsCrossedIcon,
  bag: ShoppingBagIcon,
  shirt: ShirtIcon,
  subscription: RepeatIcon,
  plane: PlaneIcon,
  game: Gamepad2Icon,
  gym: DumbbellIcon,
  gift: GiftIcon,
  phone: SmartphoneIcon,
  wifi: WifiIcon,
  work: BriefcaseIcon,
  card: CreditCardIcon,
  savings: PiggyBankIcon,
  beauty: SparklesIcon,
  banknote: BanknoteIcon,
  transfer: ArrowLeftRightIcon,
  other: MoreHorizontalIcon,
}

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS)

export function getCategoryIcon(icon: string): LucideIcon {
  return CATEGORY_ICONS[icon] ?? MoreHorizontalIcon
}

// Paleta de cores (hex guardado no banco).
export const CATEGORY_COLORS = [
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#64748b",
] as const

// Categorias padrão (pt-BR) criadas automaticamente para cada novo usuário.
export const DEFAULT_CATEGORIES: Array<{
  name: string
  type: CategoryType
  color: string
  icon: string
}> = [
  { name: "Moradia", type: "essential", color: "#3b82f6", icon: "home" },
  { name: "Mercado", type: "essential", color: "#22c55e", icon: "cart" },
  { name: "Transporte", type: "essential", color: "#06b6d4", icon: "car" },
  { name: "Saúde", type: "essential", color: "#ef4444", icon: "health" },
  { name: "Contas", type: "essential", color: "#64748b", icon: "receipt" },
  { name: "Educação", type: "essential", color: "#6366f1", icon: "education" },
  { name: "Restaurantes", type: "non_essential", color: "#f97316", icon: "food" },
  { name: "Compras", type: "non_essential", color: "#ec4899", icon: "bag" },
  { name: "Lazer", type: "non_essential", color: "#8b5cf6", icon: "game" },
  { name: "Assinaturas", type: "non_essential", color: "#d946ef", icon: "subscription" },
  { name: "Viagem", type: "non_essential", color: "#14b8a6", icon: "plane" },
  { name: "Outros", type: "non_essential", color: "#eab308", icon: "other" },
  { name: "Salário", type: "income", color: "#22c55e", icon: "banknote" },
  { name: "Investimentos", type: "income", color: "#3b82f6", icon: "savings" },
  { name: "Transferências", type: "income", color: "#64748b", icon: "transfer" },
]
