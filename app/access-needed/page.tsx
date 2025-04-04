"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/lib/auth-state"

export default function AccessNeededPage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // If user is admin, redirect to dashboard
    if (user?.role === "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSignOut = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600 mr-2" />
            <span className="font-bold text-2xl">StoreBill</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="h-12 w-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Access Required</h2>
            <p className="text-center text-gray-600 mb-6">
              Your account needs approval before you can access the system
            </p>

            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <span>
                Your account ({user?.email}) is pending administrator approval. Please contact your system
                administrator.
              </span>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="font-medium text-sm text-blue-800 mb-2">What happens next?</p>
              <ul className="space-y-1 list-disc pl-5 text-sm text-blue-700">
                <li>An administrator will review your access request</li>
                <li>You'll be granted appropriate permissions based on your role</li>
                <li>Once approved, you can sign in again to access the system</li>
              </ul>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-6 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

