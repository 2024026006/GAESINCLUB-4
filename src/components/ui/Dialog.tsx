'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm?: () => void | Promise<void>
  loading?: boolean
  children?: React.ReactNode
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = '확인',
  confirmVariant = 'primary',
  onConfirm,
  loading,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-xl bg-white p-0 shadow-xl backdrop:bg-black/40 w-full max-w-md"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            취소
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  )
}
