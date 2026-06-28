"use client"

import { UploadIcon } from "lucide-react"
import Papa from "papaparse"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { checkDuplicates, importTransactions } from "@/app/(app)/transacoes/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FilterSelect } from "@/components/ui/filter-select"
import { type AccountType, BANKS } from "@/constants/banks"
import { cn } from "@/utils/cn"
import {
  type BankFormat,
  type ColumnMapping,
  detectBankFormat,
  getAutoMapping,
  isFlipSign,
  normalizeRow,
} from "@/utils/csv"
import { formatBRL, formatDateBr } from "@/utils/format"

type RawRow = Record<string, string>

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "debit", label: "Débito" },
  { value: "credit", label: "Crédito" },
]

export function ImportDialog() {
  const [open, setOpen] = useState(false)
  const [bank, setBank] = useState<string>("")
  const [accountType, setAccountType] = useState<AccountType | "">("")
  const [filename, setFilename] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<RawRow[]>([])
  const [bankFormat, setBankFormat] = useState<BankFormat>("generic")
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({})
  const [duplicateIndices, setDuplicateIndices] = useState<number[] | null>(null)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setBank("")
    setAccountType("")
    setFilename("")
    setHeaders([])
    setRows([])
    setBankFormat("generic")
    setMapping({})
    setDuplicateIndices(null)
    setChecking(false)
    setSubmitting(false)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (result) => {
        const fields = (result.meta.fields ?? []).filter(Boolean)
        if (fields.length === 0) {
          toast.error("Não foi possível ler as colunas do CSV")
          return
        }
        const fmt = detectBankFormat(fields)
        setFilename(file.name)
        setHeaders(fields)
        setRows(result.data)
        setBankFormat(fmt)
        setMapping(getAutoMapping(fmt, fields))
        setDuplicateIndices(null)
      },
      error: () => toast.error("Falha ao ler o arquivo"),
    })
  }

  const validRows = useMemo(() => {
    if (!mapping.date || !mapping.description || !mapping.amount) return []
    const full = mapping as ColumnMapping
    const flip = isFlipSign(bankFormat)
    return rows
      .map((row) => normalizeRow(row, full, flip))
      .filter((r): r is NonNullable<typeof r> => r !== null)
  }, [rows, mapping, bankFormat])

  useEffect(() => {
    if (validRows.length === 0) {
      setDuplicateIndices(null)
      return
    }
    setChecking(true)
    setDuplicateIndices(null)
    checkDuplicates(validRows).then((result) => {
      setDuplicateIndices(result.duplicateIndices)
      setChecking(false)
    })
  }, [validRows])

  const ignored = rows.length - validRows.length
  const bankAccountReady = Boolean(bank && accountType)
  const ready = Boolean(bankAccountReady && validRows.length > 0)

  const duplicateSet = useMemo(() => new Set(duplicateIndices ?? []), [duplicateIndices])
  const newCount =
    duplicateIndices !== null ? validRows.length - duplicateIndices.length : validRows.length

  async function handleImport(skipDuplicates: boolean) {
    const rowsToImport =
      skipDuplicates && duplicateIndices !== null
        ? validRows.filter((_, i) => !duplicateSet.has(i))
        : validRows

    if (rowsToImport.length === 0) {
      toast.info("Nenhuma transação nova para importar")
      return
    }

    setSubmitting(true)
    const result = await importTransactions({
      filename,
      bank: bank || undefined,
      accountType: (accountType as AccountType) || undefined,
      rows: rowsToImport,
    })
    setSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(`${result.count} transações importadas`)
    handleOpenChange(false)
  }

  const hasDuplicates = duplicateIndices !== null && duplicateIndices.length > 0

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UploadIcon />
        Importar CSV
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="min-w-fit">
          <DialogHeader>
            <DialogTitle>Importar transações</DialogTitle>
            <DialogDescription>
              Selecione o banco, o tipo de extrato e envie o arquivo CSV.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-3">
              <FilterSelect
                value={bank}
                onChange={setBank}
                options={[
                  { value: "", label: "Banco" },
                  ...BANKS.map((b) => ({ value: b.id, label: b.name })),
                ]}
                className="w-full"
              />
              <FilterSelect
                value={accountType}
                onChange={(v) => setAccountType(v as AccountType | "")}
                options={[{ value: "", label: "Tipo de extrato" }, ...ACCOUNT_TYPE_OPTIONS]}
                className="w-full"
              />
            </div>

            {headers.length === 0 ? (
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground transition-colors",
                  bankAccountReady ? "hover:bg-muted" : "pointer-events-none opacity-40",
                )}
              >
                <UploadIcon className="size-6" />
                <span>
                  {bankAccountReady
                    ? "Clique para selecionar um arquivo .csv"
                    : "Selecione o banco e o tipo primeiro"}
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFile}
                  disabled={!bankAccountReady}
                />
              </label>
            ) : (
              <div className="grid gap-4">
                <div className="rounded-lg border border-border">
                  <div className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
                    {validRows.length} válidas
                    {ignored > 0 && ` · ${ignored} ignoradas`}
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {validRows.map((r, i) => (
                      <div
                        key={`${r.date}-${r.amount}-${r.description}`}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2 text-sm",
                          duplicateSet.has(i) && "opacity-40",
                        )}
                      >
                        <span className="w-20 shrink-0 text-muted-foreground">
                          {formatDateBr(r.date)}
                        </span>
                        <span className="flex-1 truncate">{r.description}</span>
                        <span
                          className={cn(
                            "shrink-0 font-medium",
                            r.type === "expense" ? "text-foreground" : "text-primary",
                          )}
                        >
                          {r.type === "expense" ? "-" : "+"}
                          {formatBRL(r.amount)}
                        </span>
                      </div>
                    ))}
                    {validRows.length === 0 && (
                      <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                        Selecione as colunas para ver a prévia.
                      </p>
                    )}
                  </div>
                </div>

                {checking && (
                  <p className="text-xs text-muted-foreground">Verificando duplicatas...</p>
                )}

                {hasDuplicates && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-sm">
                    <span className="font-medium text-amber-400">
                      {duplicateIndices.length}{" "}
                      {duplicateIndices.length === 1 ? "Inconsistência" : "Inconsistências"}
                    </span>
                    <span className="text-muted-foreground"> · {newCount} novas</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>

            {hasDuplicates ? (
              <>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => handleImport(false)}
                  disabled={!ready || submitting}
                >
                  {submitting ? "Importando..." : "Importar tudo"}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleImport(true)}
                  disabled={!ready || submitting || checking || newCount === 0}
                >
                  {submitting ? "Importando..." : `Importar ${newCount} novas`}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => handleImport(false)}
                disabled={!ready || submitting || checking}
              >
                {checking
                  ? "Verificando..."
                  : submitting
                    ? "Importando..."
                    : `Importar ${validRows.length || ""}`.trim()}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
