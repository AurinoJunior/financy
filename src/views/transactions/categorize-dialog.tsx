"use client"

import { SparklesIcon } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CategorizeDialogProps {
  open: boolean
  done: boolean
  onClose: () => void
}

export function CategorizeDialog({ open, done, onClose }: CategorizeDialogProps) {
  const [progress, setProgress] = useState(0)
  const [slowTransition, setSlowTransition] = useState(false)

  // Quando abre: reseta e inicia animação 0 → 95% em 4s
  useEffect(() => {
    if (!open) {
      setSlowTransition(false)
      setProgress(0)
      return
    }
    // Dois frames garantem que o elemento renderiza em 0% antes de iniciar a transição CSS
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSlowTransition(true)
        setProgress(95)
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [open])

  // Quando a requisição termina: salta para 100% e fecha
  useEffect(() => {
    if (!done) return
    setSlowTransition(false)
    setProgress(100)
    const t = setTimeout(onClose, 600)
    return () => clearTimeout(t)
  }, [done, onClose])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="max-w-xs gap-5">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SparklesIcon className="size-5" />
            </div>
            <DialogTitle>Categorizando com IA</DialogTitle>
          </div>
          <DialogDescription>
            Analisando padrões e classificando suas transações...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${progress}%`,
                transition: slowTransition ? "width 5s ease-out" : "none",
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress < 100 ? "Processando..." : "Concluído"}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
