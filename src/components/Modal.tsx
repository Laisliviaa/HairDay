import { useEffect, useRef, type ReactNode } from 'react'

type Props = { open: boolean; onClose: () => void; children: ReactNode }

export function Modal({ open, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return <dialog ref={ref} onClose={onClose}>{open && children}</dialog>
}
