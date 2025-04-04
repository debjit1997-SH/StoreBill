"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useAuthStore } from "@/lib/auth-state"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/providers/toast-provider"
import ProfessionalInvoice from "@/components/professional-invoice"
import HomeButton from "@/components/home-button"

export default function InvoiceViewPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()

  const { bills, customers } = useStore()
  const [bill, setBill] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (params.id) {
      const billId = Number(params.id)
      const foundBill = bills.find((b) => b.id === billId)

      if (foundBill) {
        setBill(foundBill)

        if (foundBill.customerId) {
          const foundCustomer = customers.find((c) => c.id === foundBill.customerId)
          if (foundCustomer) {
            setCustomer(foundCustomer)
          }
        }
        setLoading(false)
      } else {
        showToast("error", "Invoice not found")
        router.push("/dashboard/invoices")
      }
    }
  }, [isAuthenticated, params.id, router, bills, customers, showToast])

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push("/dashboard/invoices")} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Invoice {bill.billNumber}</h1>
          </div>
          <HomeButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <ProfessionalInvoice bill={bill} customer={customer} onNotify={(type, message) => showToast(type, message)} />
      </main>
    </div>
  )
}

