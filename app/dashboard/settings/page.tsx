"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Upload, Plus, Trash2, Download, SettingsIcon, DollarSign, FileText, Tag } from "lucide-react"
import { useAuthStore } from "@/lib/auth-state"
import { useStore, type Currency } from "@/lib/store"
import { useToast } from "@/components/providers/toast-provider"
import HomeButton from "@/components/home-button"

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const { settings, updateSettings, addCurrency, updateCurrency, deleteCurrency, setActiveCurrency } = useStore()
  const { showToast } = useToast()

  // Initialize with defaults if settings are missing
  const defaultSettings = {
    name: "My Store",
    address: "123 Store Street, City",
    phone: "1234567890",
    email: "store@example.com",
    gst: "22AAAAA0000A1Z5",
    primaryColor: "#4F46E5",
    enableGst: true,
    splitGst: true,
    enableTcs: false,
    enableTds: false,
  }

  const [name, setName] = useState(settings?.name || defaultSettings.name)
  const [address, setAddress] = useState(settings?.address || defaultSettings.address)
  const [phone, setPhone] = useState(settings?.phone || defaultSettings.phone)
  const [email, setEmail] = useState(settings?.email || defaultSettings.email)
  const [gst, setGst] = useState(settings?.gst || defaultSettings.gst)
  const [primaryColor, setPrimaryColor] = useState(settings?.primaryColor || defaultSettings.primaryColor)
  const [enableGst, setEnableGst] = useState(settings?.enableGst ?? defaultSettings.enableGst)
  const [splitGst, setSplitGst] = useState(settings?.splitGst ?? defaultSettings.splitGst)
  const [enableTcs, setEnableTcs] = useState(settings?.enableTcs ?? defaultSettings.enableTcs)
  const [enableTds, setEnableTds] = useState(settings?.enableTds ?? defaultSettings.enableTds)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Currency states
  const defaultCurrency = { code: "INR", name: "Indian Rupee", symbol: "₹", exchangeRate: 1 }
  const defaultCurrencies = [defaultCurrency]

  const [selectedCurrency, setSelectedCurrency] = useState(settings?.currency?.code || defaultCurrency.code)
  const [newCurrencyCode, setNewCurrencyCode] = useState("")
  const [newCurrencyName, setNewCurrencyName] = useState("")
  const [newCurrencySymbol, setNewCurrencySymbol] = useState("")
  const [newCurrencyRate, setNewCurrencyRate] = useState("1")
  const [showAddCurrency, setShowAddCurrency] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null)
  const [editCurrencyRate, setEditCurrencyRate] = useState("1")

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          updateSettings({ logo: event.target.result as string })
          showToast("success", "Logo uploaded successfully")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle QR code upload
  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          updateSettings({ qrCode: event.target.result as string })
          showToast("success", "QR Code uploaded successfully")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Save settings
  const handleSaveSettings = () => {
    setIsSaving(true)

    setTimeout(() => {
      updateSettings({
        name,
        address,
        phone,
        email,
        gst,
        primaryColor,
        enableGst,
        splitGst,
        enableTcs,
        enableTds,
      })

      showToast("success", "Settings saved successfully")
      setIsSaving(false)
    }, 800)
  }

  // In the formatCurrency function
  const formatCurrency = (amount: number) => {
    try {
      const currency = settings?.currency || defaultCurrency
      return `${currency.symbol}${amount.toFixed(2)}`
    } catch (error) {
      // Fallback to INR if there's an error
      return `₹${amount.toFixed(2)}`
    }
  }

  // Handle currency change
  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code)
    setActiveCurrency(code)
    showToast("success", `Currency changed to ${code}`)
  }

  // Add new currency
  const handleAddCurrency = () => {
    if (!newCurrencyCode || !newCurrencyName || !newCurrencySymbol || !newCurrencyRate) {
      showToast("error", "All currency fields are required")
      return
    }

    const newCurrency: Currency = {
      code: newCurrencyCode.toUpperCase(),
      name: newCurrencyName,
      symbol: newCurrencySymbol,
      exchangeRate: Number.parseFloat(newCurrencyRate),
    }

    addCurrency(newCurrency)
    showToast("success", `Currency ${newCurrencyCode.toUpperCase()} added successfully`)

    // Reset form
    setNewCurrencyCode("")
    setNewCurrencyName("")
    setNewCurrencySymbol("")
    setNewCurrencyRate("1")
    setShowAddCurrency(false)
  }

  // Update currency exchange rate
  const handleUpdateCurrencyRate = (code: string) => {
    if (!editCurrencyRate) {
      showToast("error", "Exchange rate is required")
      return
    }

    updateCurrency(code, { exchangeRate: Number.parseFloat(editCurrencyRate) })
    showToast("success", `Exchange rate for ${code} updated successfully`)
    setEditingCurrency(null)
  }

  // Delete currency
  const handleDeleteCurrency = (code: string) => {
    if (code === "INR") {
      showToast("error", "Cannot delete base currency (INR)")
      return
    }

    deleteCurrency(code)
    showToast("success", `Currency ${code} deleted successfully`)

    // If deleted currency was selected, revert to INR
    if (selectedCurrency === code) {
      setSelectedCurrency("INR")
      setActiveCurrency("INR")
    }
  }

  // Generate and download sample report
  const handleExportReport = () => {
    showToast("info", "Generating report...")

    setTimeout(() => {
      try {
        // Create a simple CSV report
        const headers = "Date,Invoice,Customer,Amount,Tax\n"
        const rows =
          settings?.bills
            ?.map(
              (bill) =>
                `${new Date(bill.createdAt).toLocaleDateString()},${bill.billNumber},${bill.customerName || "Walk-in"},${bill.total},${bill.gstAmount}`,
            )
            .join("\n") || "No data"

        const csvContent = headers + rows

        // Create a blob and download
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showToast("success", "Report downloaded successfully")
      } catch (error) {
        console.error("Error generating report:", error)
        showToast("error", "Failed to generate report")
      }
    }, 1500)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Only admin and manager can access settings
    if (user?.role !== "admin" && user?.role !== "manager") {
      showToast("error", "You don't have permission to access settings")
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router, showToast])

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "manager")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  // Ensure we have available currencies
  const availableCurrencies = settings?.availableCurrencies || defaultCurrencies

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-medium">Store Settings</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleExportReport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
            <HomeButton />
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "general" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveTab("currency")}
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "currency"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Currency
          </button>
          <button
            onClick={() => setActiveTab("tax")}
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "tax" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Tax
          </button>
          <button
            onClick={() => setActiveTab("branding")}
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activeTab === "branding"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Tag className="h-4 w-4 mr-2" />
            Branding
          </button>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <h4 className="font-medium text-blue-800 mb-2">Store Information</h4>
                <p className="text-sm text-blue-700">This information will appear on your invoices and receipts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "currency" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <h4 className="font-medium text-blue-800 mb-2">Currency Settings</h4>
                <p className="text-sm text-blue-700">Configure the currencies you want to use in your store.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                  <h5 className="font-medium">Available Currencies</h5>
                  <button
                    onClick={() => setShowAddCurrency(!showAddCurrency)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {showAddCurrency ? "Cancel" : "Add Currency"}
                  </button>
                </div>

                {showAddCurrency && (
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Code</label>
                        <input
                          type="text"
                          value={newCurrencyCode}
                          onChange={(e) => setNewCurrencyCode(e.target.value)}
                          placeholder="USD"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          maxLength={3}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Symbol</label>
                        <input
                          type="text"
                          value={newCurrencySymbol}
                          onChange={(e) => setNewCurrencySymbol(e.target.value)}
                          placeholder="$"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          maxLength={3}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={newCurrencyName}
                        onChange={(e) => setNewCurrencyName(e.target.value)}
                        placeholder="US Dollar"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Exchange Rate (1 INR =)</label>
                      <input
                        type="number"
                        value={newCurrencyRate}
                        onChange={(e) => setNewCurrencyRate(e.target.value)}
                        step="0.0001"
                        min="0.0001"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      onClick={handleAddCurrency}
                      className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700"
                    >
                      Add Currency
                    </button>
                  </div>
                )}

                <div className="max-h-80 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Symbol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {availableCurrencies.map((currency) => (
                        <tr key={currency.code} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{currency.code}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{currency.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{currency.symbol}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {editingCurrency === currency.code ? (
                              <input
                                type="number"
                                value={editCurrencyRate}
                                onChange={(e) => setEditCurrencyRate(e.target.value)}
                                step="0.0001"
                                min="0.0001"
                                className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
                              />
                            ) : (
                              currency.exchangeRate
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                            {editingCurrency === currency.code ? (
                              <button
                                onClick={() => handleUpdateCurrencyRate(currency.code)}
                                className="text-green-600 hover:text-green-900 text-xs font-medium"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingCurrency(currency.code)
                                  setEditCurrencyRate(currency.exchangeRate.toString())
                                }}
                                className="text-blue-600 hover:text-blue-900 text-xs font-medium mr-3"
                                disabled={currency.code === "INR"}
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCurrency(currency.code)}
                              className="text-red-600 hover:text-red-900 text-xs font-medium"
                              disabled={currency.code === "INR"}
                            >
                              <Trash2 className="h-3 w-3 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tax" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <h4 className="font-medium text-blue-800 mb-2">Tax Settings</h4>
                <p className="text-sm text-blue-700">Configure tax settings for your invoices and reports.</p>
              </div>

              <div className="space-y-4 bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="gst-enabled"
                      checked={enableGst}
                      onChange={(e) => setEnableGst(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="gst-enabled" className="ml-2 text-sm font-medium text-gray-700">
                      Enable GST
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">Goods and Services Tax</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="cgst-sgst"
                      checked={splitGst}
                      onChange={(e) => setSplitGst(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="cgst-sgst" className="ml-2 text-sm font-medium text-gray-700">
                      Split GST into CGST & SGST
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">For intra-state transactions</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tcs-enabled"
                      checked={enableTcs}
                      onChange={(e) => setEnableTcs(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tcs-enabled" className="ml-2 text-sm font-medium text-gray-700">
                      Enable TCS
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">Tax Collected at Source</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tds-enabled"
                      checked={enableTds}
                      onChange={(e) => setEnableTds(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tds-enabled" className="ml-2 text-sm font-medium text-gray-700">
                      Enable TDS
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">Tax Deducted at Source</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "branding" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <h4 className="font-medium text-blue-800 mb-2">Branding Settings</h4>
                <p className="text-sm text-blue-700">Customize the look and feel of your store and invoices.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                      {settings?.logo ? (
                        <img
                          src={settings.logo || "/placeholder.svg"}
                          alt="Store Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs text-center">No Logo</div>
                      )}
                    </div>
                    <label className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50 shadow-sm">
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <Upload className="h-4 w-4 inline mr-2" />
                      Upload Logo
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment QR Code</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                      {settings?.qrCode ? (
                        <img
                          src={settings.qrCode || "/placeholder.svg"}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs text-center">No QR</div>
                      )}
                    </div>
                    <label className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50 shadow-sm">
                      <input type="file" accept="image/*" className="hidden" onChange={handleQrCodeUpload} />
                      <Upload className="h-4 w-4 inline mr-2" />
                      Upload QR Code
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 border-0 p-0 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-2">{primaryColor}</div>
                    <div className="h-8 rounded-md" style={{ backgroundColor: primaryColor }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

