'use client'

import { useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export function ToastSubmitButton({ label, className = '' }: { label: string, className?: string }) {
  const { pending } = useFormStatus()
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !pending) {
      // The form has just finished submitting
      toast.success('保存しました', { id: 'save-success' })
    }
    wasPending.current = pending
  }, [pending])

  return (
    <button 
      type="submit" 
      disabled={pending} 
      className={`${className} transition-opacity ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {pending ? '保存中...' : label}
    </button>
  )
}
