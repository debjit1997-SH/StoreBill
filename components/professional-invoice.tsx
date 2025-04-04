"use client"

import { useRef, useState, useEffect } from "react"
import { Download, Printer, Check } from "lucide-react"
import { type Bill, type Customer, useStore } from "@/lib/store"

interface ProfessionalInvoiceProps {
  bill: Bill
  customer: Customer | null
  onNotify?: (type: "success" | "error" | "info" | "warning", message: string) => void
}

export default function ProfessionalInvoice({ bill, customer, onNotify }: ProfessionalInvoiceProps) {
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

  // Print function
  const handlePrint = () => {
    try {
      setIsPrinting(true)
      if (onNotify) onNotify("info", "Preparing to print...")

      // Create a printable version
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        if (onNotify) onNotify("error", "Could not open print window. Please check your popup settings.")
        setIsPrinting(false)
        return
      }

      // Get the invoice content
      const invoiceContent = invoiceRef.current?.innerHTML || ""

      // Add print styles
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${bill.billNumber}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .invoice-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                padding: 20mm 15mm;
                box-sizing: border-box;
                background: white;
                position: relative;
              }
              .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .company-info h1 {
                font-size: 24px;
                margin: 0 0 5px 0;
                color: #333;
              }
              .company-info p {
                margin: 2px 0;
                color: #666;
                font-size: 12px;
              }
              .invoice-details {
                text-align: right;
              }
              .invoice-details h2 {
                font-size: 20px;
                margin: 0 0 5px 0;
                color: #2563eb;
              }
              .invoice-details p {
                margin: 2px 0;
                color: #666;
                font-size: 12px;
              }
              .customer-info {
                background: #f9fafb;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                font-size: 12px;
              }
              .customer-info h3 {
                margin: 0 0 5px 0;
                color: #333;
                font-size: 14px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                font-size: 12px;
              }
              th {
                background: #f9fafb;
                padding: 8px;
                text-align: left;
                font-weight: 600;
                color: #333;
                border-bottom: 1px solid #e5e7eb;
                font-size: 11px;
              }
              td {
                padding: 8px;
                border-bottom: 1px solid #e5e7eb;
                color: #4b5563;
                font-size: 12px;
              }
              .text-right {
                text-align: right;
              }
              .summary {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 20px;
              }
              .summary-table {
                width: 250px;
                border: 1px solid #e5e7eb;
                border-radius: 5px;
                overflow: hidden;
              }
              .summary-table tr:last-child td {
                border-bottom: none;
              }
              .summary-table .total-row {
                background: #f9fafb;
                font-weight: bold;
                color: #333;
              }
              .payment-info, .notes, .terms {
                margin-bottom: 15px;
                font-size: 12px;
              }
              .payment-info h3, .notes h3, .terms h3 {
                margin: 0 0 5px 0;
                color: #333;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 11px;
                position: absolute;
                bottom: 20mm;
                left: 15mm;
                right: 15mm;
              }
              .status-paid {
                color: #059669;
              }
              .status-pending {
                color: #d97706;
              }
              .status-cancelled {
                color: #dc2626;
              }
              .logo {
                max-height: 60px;
                max-width: 200px;
                object-fit: contain;
              }
              .items-table {
                page-break-inside: avoid;
              }
              .items-table th, .items-table td {
                padding: 6px 8px;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .invoice-container {
                  width: 100%;
                  height: 100%;
                  padding: 15mm;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${invoiceContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.setTimeout(function() {
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `)

      printWindow.document.close()

      // Handle print success
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

  // Download as PDF
  const handleDownload = () => {
    try {
      setIsDownloading(true)
      if (onNotify) onNotify("info", "Preparing PDF for download...")

      // Create a printable version
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        if (onNotify) onNotify("error", "Could not open download window. Please check your popup settings.")
        setIsDownloading(false)
        return
      }

      // Get the invoice content
      const invoiceContent = invoiceRef.current?.innerHTML || ""

      // Add print styles with a message to save as PDF
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${bill.billNumber}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .pdf-message {
                background: #f0f0f0;
                padding: 15px;
                margin: 20px;
                text-align: center;
                border-radius: 5px;
              }
              .pdf-message p {
                margin: 5px 0;
              }
              .invoice-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                padding: 20mm 15mm;
                box-sizing: border-box;
                background: white;
                position: relative;
              }
              .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .company-info h1 {
                font-size: 24px;
                margin: 0 0 5px 0;
                color: #333;
              }
              .company-info p {
                margin: 2px 0;
                color: #666;
                font-size: 12px;
              }
              .invoice-details {
                text-align: right;
              }
              .invoice-details h2 {
                font-size: 20px;
                margin: 0 0 5px 0;
                color: #2563eb;
              }
              .invoice-details p {
                margin: 2px 0;
                color: #666;
                font-size: 12px;
              }
              .customer-info {
                background: #f9fafb;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                font-size: 12px;
              }
              .customer-info h3 {
                margin: 0 0 5px 0;
                color: #333;
                font-size: 14px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                font-size: 12px;
              }
              th {
                background: #f9fafb;
                padding: 8px;
                text-align: left;
                font-weight: 600;
                color: #333;
                border-bottom: 1px solid #e5e7eb;
                font-size: 11px;
              }
              td {
                padding: 8px;
                border-bottom: 1px solid #e5e7eb;
                color: #4b5563;
                font-size: 12px;
              }
              .text-right {
                text-align: right;
              }
              .summary {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 20px;
              }
              .summary-table {
                width: 250px;
                border: 1px solid #e5e7eb;
                border-radius: 5px;
                overflow: hidden;
              }
              .summary-table tr:last-child td {
                border-bottom: none;
              }
              .summary-table .total-row {
                background: #f9fafb;
                font-weight: bold;
                color: #333;
              }
              .payment-info, .notes, .terms {
                margin-bottom: 15px;
                font-size: 12px;
              }
              .payment-info h3, .notes h3, .terms h3 {
                margin: 0 0 5px 0;
                color: #333;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 11px;
                position: absolute;
                bottom: 20mm;
                left: 15mm;
                right: 15mm;
              }
              .status-paid {
                color: #059669;
              }
              .status-pending {
                color: #d97706;
              }
              .status-cancelled {
                color: #dc2626;
              }
              .logo {
                max-height: 60px;
                max-width: 200px;
                object-fit: contain;
              }
              .items-table {
                page-break-inside: avoid;
              }
              .items-table th, .items-table td {
                padding: 6px 8px;
              }
              @media print {
                .pdf-message {
                  display: none;
                }
              }
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
              ${invoiceContent}
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
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      return new Date().toLocaleDateString()
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    try {
      const currency = settings?.currency || {
        code: "INR",
        name: "Indian Rupee",
        symbol: "₹",
        exchangeRate: 1,
      }
      return `${currency.symbol}${amount.toFixed(2)}`
    } catch (error) {
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
          {/* Header */}
          <div className="header">
            <div className="company-info">
              {settings?.logo ? (
                <img src={settings.logo || "/placeholder.svg"} alt="Company Logo" className="logo mb-2" />
              ) : null}
              <h1>{settings?.name || "My Store"}</h1>
              <p>{settings?.address || "123 Store Street, City"}</p>
              <p>Phone: {settings?.phone || "1234567890"}</p>
              <p>Email: {settings?.email || "store@example.com"}</p>
              {settings?.gst && <p>GSTIN: {settings?.gst}</p>}
            </div>
            <div className="invoice-details">
              <h2>INVOICE</h2>
              <p>
                <strong>Invoice #:</strong> {bill.billNumber}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(bill.createdAt)}
              </p>
              <p>
                <strong>Status:</strong> <span className={`status-${bill.status}`}>{bill.status.toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="customer-info">
            <h3>Bill To:</h3>
            <p>
              <strong>{customer?.name || bill.customerName || "Walk-in Customer"}</strong>
            </p>
            {customer && (
              <>
                <p>{customer.address}</p>
                <p>Phone: {customer.phone}</p>
                {customer.email && <p>Email: {customer.email}</p>}
              </>
            )}
          </div>

          {/* Invoice Items */}
          <table className="items-table">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "40%" }}>Item</th>
                <th style={{ width: "15%" }} className="text-right">
                  Price
                </th>
                <th style={{ width: "10%" }} className="text-right">
                  Qty
                </th>
                <th style={{ width: "10%" }} className="text-right">
                  GST %
                </th>
                <th style={{ width: "10%" }} className="text-right">
                  GST Amt
                </th>
                <th style={{ width: "10%" }} className="text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => {
                const itemTotal = item.price * item.quantity
                const itemGst = itemTotal * (item.gst / 100)
                const itemTotalWithGst = itemTotal + itemGst

                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td className="text-right">{formatCurrency(item.price)}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{item.gst}%</td>
                    <td className="text-right">{formatCurrency(itemGst)}</td>
                    <td className="text-right">{formatCurrency(itemTotalWithGst)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Invoice Summary */}
          <div className="summary">
            <table className="summary-table">
              <tbody>
                <tr>
                  <td>Subtotal:</td>
                  <td className="text-right">{formatCurrency(bill.subtotal)}</td>
                </tr>
                <tr>
                  <td>GST:</td>
                  <td className="text-right">{formatCurrency(bill.gstAmount)}</td>
                </tr>
                {bill.discount > 0 && (
                  <tr>
                    <td>Discount ({bill.discount}%):</td>
                    <td className="text-right">-{formatCurrency(bill.discountAmount)}</td>
                  </tr>
                )}
                <tr className="total-row">
                  <td>Total:</td>
                  <td className="text-right">{formatCurrency(bill.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Information */}
          <div className="payment-info">
            <h3>Payment Information:</h3>
            <p>
              <strong>Payment Method:</strong> <span className="capitalize">{bill.paymentMethod}</span>
            </p>
            <p>
              <strong>Payment Status:</strong> <span className={`status-${bill.status} capitalize`}>{bill.status}</span>
            </p>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="notes">
              <h3>Notes:</h3>
              <p>{bill.notes}</p>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="terms">
            <h3>Terms & Conditions:</h3>
            <ul style={{ paddingLeft: "20px", margin: "5px 0" }}>
              <li>Payment is due within 15 days</li>
              <li>Goods once sold will not be taken back</li>
              <li>All disputes are subject to local jurisdiction</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="footer">
            <p>Thank you for your business!</p>
            <p>
              {settings?.name || "My Store"} | {settings?.phone || "1234567890"} |{" "}
              {settings?.email || "store@example.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

