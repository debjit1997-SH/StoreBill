"use client"

import { Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomeButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push("/dashboard")}
      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      aria-label="Go to Dashboard"
    >
      <Home className="h-4 w-4" />
      <span>Home</span>
    </button>
  )
}

