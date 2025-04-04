"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import { ToastContainer, type ToastType } from "@/components/ui/toast"

type ToastContextType = {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<
    Array<{
      id: string
      type: ToastType
      message: string
    }>
  >([])

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

