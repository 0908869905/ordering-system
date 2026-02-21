import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel: string
  cancelLabel: string
}

export default function ConfirmDialog({ open, message, onConfirm, onCancel, confirmLabel, cancelLabel }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-warm-950/60 backdrop-blur-sm animate-fade-in">
      <div className="organic-radius bg-[#2e2a22] border border-warm-700/30 p-6 mx-6 max-w-sm w-full text-center animate-bounce-in">
        <AlertTriangle className="mx-auto h-8 w-8 text-accent-500 mb-3" />
        <p className="font-heading font-medium text-warm-100 mb-4">{message}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" className="flex-1 border-warm-600/30 text-warm-300" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" size="lg" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
