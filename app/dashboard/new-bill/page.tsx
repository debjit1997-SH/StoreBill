"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  CreditCard,
  QrCode,
  ChevronsUpDown,
  Check,
  Users,
  Package,
  FileText,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-state"
import { useStore, type Customer, type Product, type BillItem } from "@/lib/store"
import AddCustomerModal from "@/components/add-customer-modal"
import Modal from "@/components/ui/modal"
import ProfessionalInvoice from "@/components/professional-invoice"
import { useToast } from "@/components/providers/toast-provider"
import HomeButton from "@/components/home-button"
import QuickAddProductModal from "@/components/quick-add-product-modal"

export default function NewBillPage() {
  const { showToast } = useToast()
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const invoiceRef = useRef<HTMLDivElement>(null)

  // Store state
  const { customers, products, addBill, settings } = useStore()

  // Bill state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [productSearch, setProductSearch] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash")
  const [showQrCode, setShowQrCode] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState("")
  const [isGeneratingBill, setIsGeneratingBill] = useState(false)

  // Modal states
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [generatedBill, setGeneratedBill] = useState<any>(null)
  const [isQuickAddProductModalOpen, setIsQuickAddProductModalOpen] = useState(false)

  // Update the AddCustomerModal and QuickAddProductModal handling
  // In the NewBillPage component, add these state variables:
  const [justAddedCustomer, setJustAddedCustomer] = useState<Customer | null>(null)
  const [justAddedProduct, setJustAddedProduct] = useState<Product | null>(null)

  // Filtered customers based on search
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) || customer.phone.includes(customerSearch),
  )

  // Filtered products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()),
  )

  // Calculate bill totals
  const subtotal = billItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalGst = billItems.reduce((sum, item) => sum + item.price * item.quantity * (item.gst / 100), 0)
  const totalDiscount = subtotal * (discount / 100)
  const grandTotal = subtotal + totalGst - totalDiscount

  // Add product to bill
  const addProductToBill = (product: Product) => {
    const existingItem = billItems.find((item) => item.productId === product.id)

    if (existingItem) {
      setBillItems(
        billItems.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setBillItems([
        ...billItems,
        {
          id: Date.now(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          gst: product.gst,
        },
      ])
    }

    setProductSearch("")
    setShowProductDropdown(false)
  }

  // Update item quantity
  const updateItemQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setBillItems(billItems.filter((item) => item.id !== id))
    } else {
      setBillItems(billItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  // Remove item from bill
  const removeItem = (id: number) => {
    setBillItems(billItems.filter((item) => item.id !== id))
  }

  // Generate bill
  const generateBill = () => {
    if (billItems.length === 0) {
      showToast("error", "Please add at least one product to the bill")
      return
    }

    setIsGeneratingBill(true)

    setTimeout(() => {
      try {
        const newBill = addBill({
          customerId: selectedCustomer?.id || null,
          customerName: selectedCustomer?.name || "Walk-in Customer",
          items: billItems,
          subtotal,
          gstAmount: totalGst,
          discount,
          discountAmount: totalDiscount,
          total: grandTotal,
          paymentMethod,
          notes,
          status: "paid",
        })

        showToast("success", `Bill ${newBill.billNumber} generated successfully!`)
        setGeneratedBill(newBill)
        setIsInvoiceModalOpen(true)
        setIsGeneratingBill(false)

        // Scroll to invoice after a short delay
        setTimeout(() => {
          if (invoiceRef.current) {
            invoiceRef.current.scrollIntoView({ behavior: "smooth" })
          }
        }, 300)
      } catch (error) {
        console.error("Error generating bill:", error)
        showToast("error", "Failed to generate bill. Please try again.")
        setIsGeneratingBill(false)
      }
    }, 800)
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

  const handleProductAdded = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      addProductToBill(product)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <header className="bg-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              New Bill
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <HomeButton />
            <button
              onClick={generateBill}
              disabled={isGeneratingBill}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-sm transition-all"
            >
              <span>{isGeneratingBill ? "Generating..." : "Generate Bill"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Customer Information
              </h3>

              <div className="relative mb-4">
                <div
                  className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
                  onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                >
                  <div>
                    {selectedCustomer ? (
                      <div>
                        <p className="font-medium">{selectedCustomer.name}</p>
                        <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Select or search customer</p>
                    )}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-gray-500" />
                </div>

                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Search customers..."
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowCustomerDropdown(false)
                          }}
                        >
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                        </div>
                      ))}

                      {filteredCustomers.length === 0 && (
                        <div className="px-4 py-2 text-gray-500">No customers found</div>
                      )}
                    </div>

                    <div className="p-2 border-t">
                      <button
                        onClick={() => {
                          setIsAddCustomerModalOpen(true)
                          setShowCustomerDropdown(false)
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add New Customer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm">{selectedCustomer.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm">{selectedCustomer.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Products
                </h3>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsQuickAddProductModalOpen(true)}
                    className="flex items-center space-x-1 px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Plus className="h-3 w-3" />
                    <span>New Product</span>
                  </button>

                  <div className="relative w-64">
                    <div
                      className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
                      onClick={() => setShowProductDropdown(!showProductDropdown)}
                    >
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full focus:outline-none"
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value)
                          setShowProductDropdown(true)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Search className="h-4 w-4 text-gray-500" />
                    </div>

                    {showProductDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <div className="max-h-60 overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => addProductToBill(product)}
                            >
                              <p className="font-medium">{product.name}</p>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">₹{product.price.toFixed(2)}</span>
                                <span className="text-gray-500">GST: {product.gst}%</span>
                              </div>
                            </div>
                          ))}

                          {filteredProducts.length === 0 && (
                            <div className="px-4 py-2 text-gray-500">No products found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {billItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          GST
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {billItems.map((item) => {
                        const itemTotal = item.price * item.quantity
                        const itemGst = itemTotal * (item.gst / 100)

                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                              ₹{item.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  -
                                </button>
                                <span className="mx-2 w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                              {item.gst}%
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              ₹{(itemTotal + itemGst).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No products added to bill yet</div>
              )}
            </div>
          </div>

          {/* Right Column - Bill Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Bill Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">GST</span>
                  <span>₹{totalGst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-12 border border-gray-300 rounded-md px-1 py-1 text-right mr-1"
                    />
                    <span>% (₹{totalDiscount.toFixed(2)})</span>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Payment Method
              </h3>

              <div className="space-y-3">
                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${paymentMethod === "cash" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <svg className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Cash</span>
                  {paymentMethod === "cash" && <Check className="h-4 w-4 ml-auto text-blue-600" />}
                </div>

                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${paymentMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
                  <span>Card</span>
                  {paymentMethod === "card" && <Check className="h-4 w-4 ml-auto text-blue-600" />}
                </div>

                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${paymentMethod === "upi" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <QrCode className="h-5 w-5 mr-3 text-gray-600" />
                  <span>UPI</span>
                  {paymentMethod === "upi" && <Check className="h-4 w-4 ml-auto text-blue-600" />}
                </div>

                {paymentMethod === "upi" && (
                  <button
                    onClick={() => setShowQrCode(!showQrCode)}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {showQrCode ? "Hide QR Code" : "Show QR Code"}
                  </button>
                )}

                {paymentMethod === "upi" && showQrCode && (
                  <div className="mt-3 p-4 border border-gray-300 rounded-md flex items-center justify-center">
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                      {settings.qrCode ? (
                        <img
                          src={settings.qrCode || "/placeholder.svg"}
                          alt="Payment QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <QrCode className="h-24 w-24 text-gray-400" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-4">Notes</h3>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes to this bill..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Generated Invoice Section */}
        {generatedBill && (
          <div ref={invoiceRef} className="mt-10 pt-10 border-t-2 border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Generated Invoice</h2>
            <ProfessionalInvoice
              bill={generatedBill}
              customer={selectedCustomer}
              onNotify={(type, message) => showToast(type, message)}
            />
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onCustomerAdded={(customer) => {
          setSelectedCustomer(customer)
          setJustAddedCustomer(customer)
          showToast("success", `Customer ${customer.name} added and selected`)
        }}
      />

      {/* Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false)
        }}
        title={`Invoice ${generatedBill?.billNumber || ""}`}
        maxWidth="5xl"
      >
        {generatedBill && (
          <ProfessionalInvoice
            bill={generatedBill}
            customer={selectedCustomer}
            onNotify={(type, message) => showToast(type, message)}
          />
        )}
      </Modal>

      {/* Quick Add Product Modal */}
      <QuickAddProductModal
        isOpen={isQuickAddProductModalOpen}
        onClose={() => setIsQuickAddProductModalOpen(false)}
        onProductAdded={(productId) => {
          const product = products.find((p) => p.id === productId)
          if (product) {
            addProductToBill(product)
            setJustAddedProduct(product)
            showToast("success", `Product ${product.name} added to bill`)
          }
        }}
      />
    </div>
  )
}

