"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, AlertCircle, Eye, EyeOff, Info } from "lucide-react"
import { useAuthStore } from "@/lib/auth-state"
import { useToast } from "@/components/providers/toast-provider"
import DebugAuth from "@/components/debug-auth"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const { isAuthenticated, login, users } = useAuthStore()
  const { showToast } = useToast()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }

    // Log the current users on page load
    console.log("Current users on login page load:", users)
  }, [isAuthenticated, router, users])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting login with:", { email, password })
      console.log("Available users:", users)

      const success = await login(email, password)

      if (!success) {
        setError("Invalid email or password. Please check the debug info below for available credentials.")
      } else {
        showToast("success", "Signed in successfully")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during sign-in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
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
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Sign in to StoreBill</h2>
            <p className="text-center text-gray-600 mb-6">Access your store billing system</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-4 flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5" />
              <span>For the user "Sourav Kar", use email: karsourav98@gmail.com (not karsourav@gmail.com)</span>
            </div>

            <form onSubmit={handleSignIn}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <DebugAuth />

            <div className="mt-6 bg-blue-50 p-4 rounded-md">
              <p className="font-medium text-sm text-blue-800 mb-2">Role-Based Access:</p>
              <ul className="space-y-1 list-disc pl-5 text-sm text-blue-700">
                <li>
                  <span className="font-medium">Admin:</span> Full access to all features and settings
                </li>
                <li>
                  <span className="font-medium">Manager:</span> Can manage products, customers, billing, and view
                  reports
                </li>
                <li>
                  <span className="font-medium">Cashier:</span> Can create bills and manage customers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

