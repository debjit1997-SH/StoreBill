"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"

interface NotificationProps {
  type: "success" | "error" | "info" | "warning"
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Notification({ type, message, isVisible, onClose, duration = 3000 }: NotificationProps) {
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true)
      const timer = setTimeout(() => {
        setIsShowing(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible && !isShowing) return null

  const bgColor = {
    success: "bg-green-50 border-green-500",
    error: "bg-red-50 border-red-500",
    info: "bg-blue-50 border-blue-500",
    warning: "bg-yellow-50 border-yellow-500",
  }[type]

  const textColor = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-blue-800",
    warning: "text-yellow-800",
  }[type]

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
    warning: AlertCircle,
  }[type]

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border ${bgColor} ${textColor} shadow-lg transition-all duration-300 ${
        isShowing ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <Icon className="h-5 w-5 mr-3" />
      <span className="mr-2">{message}</span>
      <button
        onClick={() => {
          setIsShowing(false)
          setTimeout(onClose, 300)
        }}
        className="ml-auto text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

