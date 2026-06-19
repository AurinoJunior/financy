"use client"

import { UploadIcon } from "lucide-react"
import Papa from "papaparse"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { importTransactions } from "@/app/(app)/transacoes/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { type ColumnMapping, detectColumns, normalizeRow } from "@/lib/csv"
import { formatBRL, formatDateBr } from "@/lib/format"
import { cn } from "@/lib/utils"

type RawRow = Record<string, string>

const fieldLabels: Record<keyof ColumnMapping, string> = {
  date: "Data",
  description: "Descrição",
  amount: "Valor",
}

export function ImportDialog() {
  const [open, setOpen] = useState(false)
  const [filename, setFilename] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<RawRow[]>([])
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({})
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setFilename("")
    setHeaders([])
    setRows([])
    setMapping({})
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
        setFilename(file.name)
        setHeaders(fields)
        setRows(result.data)
        setMapping(detectColumns(fields))
      },
      error: () => toast.error("Falha ao ler o arquivo"),
    })
  }

  const validRows = useMemo(() => {
    if (!mapping.date || !mapping.description || !mapping.amount) return []
    const full = mapping as ColumnMapping
    return rows
      .map((row) => normalizeRow(row, full))
      .filter((r): r is NonNullable<typeof r> => r !== null)
  }, [rows, mapping])

  const ignored = rows.length - validRows.length
  const ready = Boolean(
    mapping.date && mapping.description && mapping.amount && validRows.length > 0,
  )

  async function handleImport() {
    setSubmitting(true)
    const result = await importTransactions({ filename, rows: validRows })
    setSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(`${result.count} transações importadas`)
    handleOpenChange(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UploadIcon />
        Importar CSV
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar transações</DialogTitle>
            <DialogDescription>
              Envie um extrato em CSV e confira o mapeamento das colunas.
            </DialogDescription>
          </DialogHeader>

          {headers.length === 0 ? (
            <label
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground transition-colors hover:bg-muted",
              )}
            >
              <UploadIcon className="size-6" />
              <span>Clique para selecionar um arquivo .csv</span>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            </label>
          ) : (
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(fieldLabels) as Array<keyof ColumnMapping>).map((field) => (
                  <div key={field} className="grid gap-1.5">
                    <Label className="text-xs">{fieldLabels[field]}</Label>
                    <select
                      value={mapping[field] ?? ""}
                      onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value }))}
                      className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring dark:bg-input/30"
                    >
                      <option value="">—</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border">
                <div className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
                  {validRows.length} válidas
                  {ignored > 0 && ` · ${ignored} ignoradas`}
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {validRows.slice(0, 6).map((r) => (
                    <div
                      key={`${r.date}-${r.amount}-${r.description}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
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
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleImport} disabled={!ready || submitting}>
              {submitting ? "Importando..." : `Importar ${validRows.length || ""}`.trim()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
