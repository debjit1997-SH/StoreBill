"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ShoppingCart,
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  BarChart2,
  UserCog,
  Settings,
  Download,
  Calendar,
  Plus,
  DollarSign,
  CreditCard,
  TrendingUp,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-state"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/providers/toast-provider"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function DashboardPage() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [activeTab, setActiveTab] = useState("overview")
  const { showToast } = useToast()

  // Store state
  const { customers, products, bills, settings } = useStore()

  // Calculate dashboard metrics
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0)
  const totalSales = bills.length
  const activeCustomers = customers.length
  const totalTax = bills.reduce((sum, bill) => sum + bill.gstAmount, 0)

  // Prepare data for sales chart
  const prepareSalesData = () => {
    // Get last 7 days
    const dates = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString())
    }

    // Group by date
    const salesByDate = dates.reduce((acc, date) => {
      acc[date] = { date, sales: 0, revenue: 0 }
      return acc
    }, {})

    // Fill with actual data
    bills.forEach((bill) => {
      const date = new Date(bill.createdAt).toLocaleDateString()
      if (salesByDate[date]) {
        salesByDate[date].sales += 1
        salesByDate[date].revenue += bill.total
      }
    })

    return Object.values(salesByDate)
  }

  // Prepare data for top products
  const prepareTopProducts = () => {
    // Group by product
    const salesByProduct = {}

    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        if (!salesByProduct[item.name]) {
          salesByProduct[item.name] = { name: item.name, quantity: 0, revenue: 0 }
        }
        salesByProduct[item.name].quantity += item.quantity
        salesByProduct[item.name].revenue += item.price * item.quantity
      })
    })

    return Object.values(salesByProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
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

  // Function to render the active section content
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard()
      case "billing":
        router.push("/dashboard/new-bill")
        return null
      case "invoices":
        router.push("/dashboard/invoices")
        return null
      case "customers":
        router.push("/dashboard/customers")
        return null
      case "products":
        router.push("/dashboard/products")
        return null
      case "reports":
        router.push("/dashboard/reports")
        return null
      case "users":
        router.push("/dashboard/users")
        return null
      case "settings":
        router.push("/dashboard/settings")
        return null
      default:
        return renderDashboard()
    }
  }

  // Dashboard section
  const renderDashboard = () => {
    return (
      <>
        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 px-1 ${
                activeTab === "overview" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`pb-4 px-1 ${
                activeTab === "analytics" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`pb-4 px-1 ${
                activeTab === "reports" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              Reports
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-500 font-medium">Total Revenue</h3>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</span>
              <span className="text-green-600 text-sm mt-1">+20.1% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-500 font-medium">Sales</h3>
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">+{totalSales}</span>
              <span className="text-green-600 text-sm mt-1">+19% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-500 font-medium">Active Customers</h3>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">+{activeCustomers}</span>
              <span className="text-green-600 text-sm mt-1">+{Math.min(activeCustomers, 201)} since last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-500 font-medium">Tax Collected</h3>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">₹{totalTax.toFixed(2)}</span>
              <span className="text-gray-500 text-sm mt-1">
                SGST: ₹{(totalTax / 2).toFixed(2)} | CGST: ₹{(totalTax / 2).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-medium mb-6">Sales Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareSalesData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="Revenue (₹)"
                    activeDot={{ r: 8 }}
                  />
                  <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#82ca9d" name="Sales Count" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Recent Sales</h3>
              <span className="text-sm text-gray-500">You made {totalSales} sales this month.</span>
            </div>

            <div className="space-y-4 mt-6">
              {[...bills]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 4)
                .map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between py-2 border-t">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{bill.customerName || "Walk-in Customer"}</p>
                        <p className="text-sm text-gray-500">{bill.billNumber}</p>
                      </div>
                    </div>
                    <span className="font-medium text-green-600">+₹{bill.total.toFixed(2)}</span>
                  </div>
                ))}

              {bills.length === 0 && <div className="text-center py-4 text-gray-500">No sales recorded yet</div>}
            </div>
          </div>
        </div>

        {/* Analytics Tab Content */}
        {activeTab === "analytics" && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-medium mb-6">Top Selling Products</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareTopProducts()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue (₹)" fill="#8884d8" />
                  <Bar dataKey="quantity" name="Quantity Sold" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Reports Tab Content */}
        {activeTab === "reports" && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-medium mb-6">Available Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium mb-2">Sales Report</h4>
                <p className="text-gray-500 text-sm mb-4">View detailed sales reports by date range</p>
                <button
                  onClick={() => {
                    showToast("info", "Generating sales report...")
                    setTimeout(() => showToast("success", "Report generated successfully"), 1500)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Generate Report
                </button>
              </div>

              <div className="border rounded-md p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium mb-2">Inventory Report</h4>
                <p className="text-gray-500 text-sm mb-4">Check current stock levels and inventory valuation</p>
                <button
                  onClick={() => {
                    showToast("info", "Generating inventory report...")
                    setTimeout(() => showToast("success", "Report generated successfully"), 1500)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Generate Report
                </button>
              </div>

              <div className="border rounded-md p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium mb-2">Tax Report</h4>
                <p className="text-gray-500 text-sm mb-4">Generate GST, SGST, CGST reports for tax filing</p>
                <button
                  onClick={() => {
                    showToast("info", "Generating tax report...")
                    setTimeout(() => showToast("success", "Report generated successfully"), 1500)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Generate Report
                </button>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push("/dashboard/reports")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View All Reports
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen flex bg-green-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm z-10">
        <div className="p-4 border-b flex items-center">
          <ShoppingCart className="h-6 w-6 text-blue-600 mr-2" />
          <span className="font-bold text-xl">StoreBill</span>
        </div>
        <nav className="p-2">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md w-full text-left ${
              activeSection === "dashboard" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveSection("billing")}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md w-full text-left ${
              activeSection === "billing" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Billing</span>
          </button>
          <button
            onClick={() => setActiveSection("invoices")}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md w-full text-left ${
              activeSection === "invoices" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Receipt className="h-5 w-5" />
            <span>Invoices</span>
          </button>
          <button
            onClick={() => setActiveSection("customers")}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md w-full text-left ${
              activeSection === "customers" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Customers</span>
          </button>
          <button
            onClick={() => setActiveSection("products")}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md w-full text-left ${
              activeSection === "products" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Products</span>
          </button>
          <button
            onClick={() => setActiveSection("reports")}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md w-full text-left ${
              activeSection === "reports" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart2 className="h-5 w-5" />
            <span>Reports</span>
          </button>
          <button
            onClick={() => setActiveSection("users")}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md w-full text-left ${
              activeSection === "users" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <UserCog className="h-5 w-5" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md w-full text-left ${
              activeSection === "settings" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white p-4 shadow-sm flex justify-between items-center">
          <h1 className="text-2xl font-bold">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
          <div className="flex items-center space-x-2">
            {activeSection === "dashboard" && (
              <>
                <button
                  onClick={() => {
                    const today = new Date().toLocaleDateString()
                    showToast("info", `Showing data for ${today}`)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Today</span>
                </button>
                <button
                  onClick={() => {
                    showToast("info", "Downloading report...")
                    setTimeout(() => showToast("success", "Report downloaded successfully"), 1500)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </>
            )}
            {(activeSection === "billing" || activeSection === "dashboard") && (
              <button
                onClick={() => router.push("/dashboard/new-bill")}
                className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>New Bill</span>
              </button>
            )}
          </div>
        </header>

        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  )
}

