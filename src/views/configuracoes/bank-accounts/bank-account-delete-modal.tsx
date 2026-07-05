import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BankAccountDeleteModalProps {
  deleting: { id: string; name: string } | null
  isDeleting: boolean
  onClose: () => void
  confirmDelete: () => void
}

export function BankAccountDeleteModal({
  deleting,
  isDeleting,
  onClose,
  confirmDelete,
}: BankAccountDeleteModalProps) {
  return (
    <Dialog open={!!deleting} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir conta</DialogTitle>
          <DialogDescription className="text-base">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{deleting?.name}</span>? Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
