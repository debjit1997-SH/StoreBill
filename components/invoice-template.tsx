"use client"

import { useRef, useState, useEffect } from "react"
import { Download, Printer, Check } from "lucide-react"
import { type Bill, type Customer, useStore } from "@/lib/store"

interface InvoiceTemplateProps {
  bill: Bill
  customer: Customer | null
  onNotify?: (type: "success" | "error" | "info" | "warning", message: string) => void
}

export default function InvoiceTemplate({ bill, customer, onNotify }: InvoiceTemplateProps) {
  const { settings } = useStore()
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [printSuccess, setPrintSuccess] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Simple print function that uses the browser's print functionality
  const handlePrint = () => {
    try {
      setIsPrinting(true)
      if (onNotify) onNotify("info", "Preparing to print...")

      // Create a printable version by cloning the invoice
      const printContent = invoiceRef.current?.cloneNode(true) as HTMLElement
      if (!printContent) {
        if (onNotify) onNotify("error", "Nothing to print")
        setIsPrinting(false)
        return
      }

      // Create a new window for printing
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        if (onNotify) onNotify("error", "Could not open print window. Please check your popup settings.")
        setIsPrinting(false)
        return
      }

      // Add print styles
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${bill.billNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { size: A4; margin: 10mm; }
              }
              .invoice-container { max-width: 210mm; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${printContent.outerHTML}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `)

      printWindow.document.close()

      // Handle print success/failure
      setTimeout(() => {
        setIsPrinting(false)
        setPrintSuccess(true)
        setTimeout(() => setPrintSuccess(false), 3000)
        if (onNotify) onNotify("success", "Invoice sent to printer")
      }, 1000)
    } catch (error) {
      console.error("Print error:", error)
      setIsPrinting(false)
      if (onNotify) onNotify("error", "Failed to print. Please try again.")
    }
  }

  // Download as PDF using browser print to PDF functionality
  const handleDownload = () => {
    try {
      setIsDownloading(true)
      if (onNotify) onNotify("info", "Preparing PDF for download...")

      // Create a printable version
      const printContent = invoiceRef.current?.cloneNode(true) as HTMLElement
      if (!printContent) {
        if (onNotify) onNotify("error", "Nothing to download")
        setIsDownloading(false)
        return
      }

      // Create a new window for printing to PDF
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        if (onNotify) onNotify("error", "Could not open download window. Please check your popup settings.")
        setIsDownloading(false)
        return
      }

      // Add print styles with a message to save as PDF
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${bill.billNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .pdf-message { background: #f0f0f0; padding: 10px; margin-bottom: 20px; text-align: center; }
              .pdf-message p { margin: 5px 0; }
              @media print {
                .pdf-message { display: none; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { size: A4; margin: 10mm; }
              }
              .invoice-container { max-width: 210mm; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="pdf-message">
              <p><strong>To save as PDF:</strong></p>
              <p>1. Press Ctrl+P (or Cmd+P on Mac)</p>
              <p>2. Change destination to "Save as PDF"</p>
              <p>3. Click Save</p>
            </div>
            <div class="invoice-container">
              ${printContent.outerHTML}
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()

      // Handle download success
      setIsDownloading(false)
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
      if (onNotify) onNotify("success", "PDF ready for download")
    } catch (error) {
      console.error("Download error:", error)
      setIsDownloading(false)
      if (onNotify) onNotify("error", "Failed to prepare PDF. Please try again.")
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Format currency based on settings
  const formatCurrency = (amount: number) => {
    try {
      const currency = settings.currency || { code: "INR", symbol: "₹", name: "Indian Rupee", exchangeRate: 1 }
      // Convert amount based on exchange rate
      const convertedAmount = amount * (currency.exchangeRate || 1)
      return `${currency.symbol}${convertedAmount.toFixed(2)}`
    } catch (error) {
      // Fallback to INR if there's an error
      return `₹${amount.toFixed(2)}`
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center space-x-2 p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Top
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              printSuccess ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {printSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Printed</span>
              </>
            ) : (
              <>
                <Printer className="h-4 w-4" />
                <span>{isPrinting ? "Printing..." : "Print"}</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              downloadSuccess ? "bg-green-600 text-white" : "border border-gray-300 hover:bg-gray-50"
            } disabled:opacity-50`}
          >
            {downloadSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Ready</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>{isDownloading ? "Preparing..." : "Download PDF"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* A4 Invoice Template */}
      <div className="p-8 overflow-auto max-h-[calc(100vh-120px)]">
        <div ref={invoiceRef} className="w-full max-w-[210mm] mx-auto bg-white p-10">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{settings.name || "My Store"}</h1>
              <p className="text-gray-600 mt-1 whitespace-pre-line">{settings.address || "Store Address"}</p>
              <p className="text-gray-600">Phone: {settings.phone || "1234567890"}</p>
              <p className="text-gray-600">Email: {settings.email || "store@example.com"}</p>
              {settings.gst && <p className="text-gray-600">GSTIN: {settings.gst}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-blue-600">INVOICE</h2>
              <p className="text-gray-600 mt-1">Invoice #: {bill.billNumber}</p>
              <p className="text-gray-600">Date: {formatDate(bill.createdAt)}</p>
              <p className="text-gray-600">
                Status:{" "}
                <span
                  className={`font-medium ${
                    bill.status === "paid"
                      ? "text-green-600"
                      : bill.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {bill.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8 p-4 bg-gray-50 rounded-md">
            <h3 className="text-gray-700 font-medium mb-2">Bill To:</h3>
            <p className="font-medium">{customer?.name || bill.customerName || "Walk-in Customer"}</p>
            {customer && (
              <>
                <p className="text-gray-600">{customer.address}</p>
                <p className="text-gray-600">Phone: {customer.phone}</p>
                <p className="text-gray-600">Email: {customer.email}</p>
              </>
            )}
          </div>

          {/* Invoice Items */}
          <table className="min-w-full border border-gray-200 mb-8">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  #
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Item
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Price
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Qty
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  GST %
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  GST Amt
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bill.items.map((item, index) => {
                const itemTotal = item.price * item.quantity
                const itemGst = itemTotal * (item.gst / 100)
                const itemTotalWithGst = itemTotal + itemGst

                return (
                  <tr key={item.id}>
                    <td className="py-3 px-4 text-sm text-gray-500 border-b">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 border-b">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 text-right border-b">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 text-right border-b">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 text-right border-b">{item.gst}%</td>
                    <td className="py-3 px-4 text-sm text-gray-500 text-right border-b">{formatCurrency(itemGst)}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right border-b">
                      {formatCurrency(itemTotalWithGst)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Invoice Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64 border rounded-md overflow-hidden">
              <div className="flex justify-between py-2 px-4 bg-gray-50 border-b">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 px-4 border-b">
                <span className="text-gray-600">GST:</span>
                <span className="font-medium">{formatCurrency(bill.gstAmount)}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between py-2 px-4 border-b">
                  <span className="text-gray-600">Discount ({bill.discount}%):</span>
                  <span className="font-medium">-{formatCurrency(bill.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 px-4 bg-gray-50 font-bold">
                <span>Total:</span>
                <span>{formatCurrency(bill.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-8">
            <h3 className="text-gray-700 font-medium mb-2">Payment Information:</h3>
            <p className="text-gray-600">
              Payment Method: <span className="font-medium capitalize">{bill.paymentMethod}</span>
            </p>
            <p className="text-gray-600">
              Payment Status:{" "}
              <span
                className={`font-medium capitalize ${
                  bill.status === "paid"
                    ? "text-green-600"
                    : bill.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {bill.status}
              </span>
            </p>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="mb-8 p-4 bg-gray-50 rounded-md">
              <h3 className="text-gray-700 font-medium mb-2">Notes:</h3>
              <p className="text-gray-600 whitespace-pre-line">{bill.notes}</p>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="mb-8 text-sm text-gray-500">
            <h3 className="text-gray-700 font-medium mb-2">Terms & Conditions:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payment is due within 15 days</li>
              <li>Goods once sold will not be taken back</li>
              <li>All disputes are subject to local jurisdiction</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-12 pt-8 border-t">
            <p>Thank you for your business!</p>
            <p className="mt-1">
              {settings.name || "My Store"} | {settings.phone || "1234567890"} | {settings.email || "store@example.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

