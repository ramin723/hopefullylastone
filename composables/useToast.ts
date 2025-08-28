import { useState } from '#app'

type ToastType = 'success' | 'error' | 'info'
type ToastMessage = { type: ToastType; message: string; ts: number }

export function useToast() {
  const toast = useState<ToastMessage | null>('toast', () => null)

  function show(message: string, type: ToastType = 'info') {
    toast.value = { type, message, ts: Date.now() }
  }

  function clear() {
    toast.value = null
  }

  return { toast, show, clear }
}


