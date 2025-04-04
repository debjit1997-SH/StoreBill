"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Download, Eye, FileText } from "lucide-react"
import { useAuthStore } from "@/lib/auth-state"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/providers/toast-provider"
import Modal from "@/components/ui/modal"
import ProfessionalInvoice from "@/components/professional-invoice"
import HomeButton from "@/components/home-button"

export default function InvoicesPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const { bills, customers } = useStore()
  const { showToast } = useToast()

  const [search, setSearch] = useState("")
  const [selectedBill, setSelectedBill] = useState<any>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState<number | null>(null)

  // Filtered bills based on search
  const filteredBills = bills.filter(
    (bill) =>
      bill.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      (bill.customerName && bill.customerName.toLowerCase().includes(search.toLowerCase())),
  )

  // View invoice
  const handleViewInvoice = (billId: number) => {
    const bill = bills.find((b) => b.id === billId)
    if (bill) {
      setSelectedBill(bill)

      if (bill.customerId) {
        const customer = customers.find((c) => c.id === bill.customerId)
        setSelectedCustomer(customer || null)
      } else {
        setSelectedCustomer(null)
      }

      setIsViewModalOpen(true)
    }
  }

  // Download invoice
  const handleDownloadInvoice = async (billId: number) => {
    const bill = bills.find((b) => b.id === billId)
    if (!bill) {
      showToast("error", "Invoice not found")
      return
    }

    setIsDownloading(billId)
    showToast("info", `Preparing invoice ${bill.billNumber} for download...`)

    try {
      // Open in a new tab for download
      window.open(`/dashboard/invoice/${billId}`, "_blank")

      // Show success message after a delay
      setTimeout(() => {
        showToast("success", `Invoice ${bill.billNumber} ready for download`)
        setIsDownloading(null)
      }, 1500)
    } catch (error) {
      console.error("Error downloading invoice:", error)
      showToast("error", "Failed to download invoice")
      setIsDownloading(null)
    }
  }

  // View full page invoice
  const handleViewFullPageInvoice = (billId: number) => {
    router.push(`/dashboard/invoice/${billId}`)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Invoices</h3>
          <HomeButton />
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.billNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bill.customerName || "Walk-in Customer"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{bill.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bill.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : bill.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleViewInvoice(bill.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleViewFullPageInvoice(bill.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Full Page
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(bill.id)}
                      disabled={isDownloading === bill.id}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {isDownloading === bill.id ? "Preparing..." : "Download"}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Invoice ${selectedBill?.billNumber || ""}`}
        maxWidth="5xl"
      >
        {selectedBill && (
          <ProfessionalInvoice
            bill={selectedBill}
            customer={selectedCustomer}
            onNotify={(type, message) => showToast(type, message)}
          />
        )}
      </Modal>
    </div>
  )
}

