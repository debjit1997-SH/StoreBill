"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { createPortal } from "react-dom"

export type ToastType = "success" | "error" | "info" | "warning"

interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose: () => void
}

export function Toast({ type, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Start the progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 100 / (duration / 100)
      })
    }, 100)

    setIntervalId(interval)

    // Auto-close after duration
    const timeout = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [duration, onClose])

  // Pause progress on hover
  const handleMouseEnter = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }

  // Resume progress on mouse leave
  const handleMouseLeave = () => {
    if (!intervalId) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval)
            return 0
          }
          return prev - 100 / (duration / 100)
        })
      }, 100)
      setIntervalId(interval)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  }[type]

  const colors = {
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-800",
      progress: "bg-green-500",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-800",
      progress: "bg-red-500",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-800",
      progress: "bg-blue-500",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-800",
      progress: "bg-yellow-500",
    },
  }[type]

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
      style={{ top: "1rem", right: "1rem", maxWidth: "calc(100% - 2rem)" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`${colors.bg} ${colors.text} border ${colors.border} rounded-lg shadow-lg overflow-hidden`}
        style={{ minWidth: "300px" }}
      >
        <div className="flex p-4">
          <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
          <div className="flex-1 mr-2">
            <p className="font-medium">{message}</p>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={`h-1 ${colors.progress} transition-all duration-100`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: ToastType
    message: string
  }>
  removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) return null

  return createPortal(
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
      {toasts.map((toast, index) => (
        <div key={toast.id} className="pointer-events-auto" style={{ marginTop: `${index * 0.5}rem` }}>
          <Toast type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>,
    document.body,
  )
}

