"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Download, BarChart2, PieChart, LineChart, TrendingUp } from "lucide-react"
import { useAuthStore } from "@/lib/auth-state"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/providers/toast-provider"
import HomeButton from "@/components/home-button"
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function ReportsPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const { bills, products, customers } = useStore()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState("sales")
  const [dateRange, setDateRange] = useState("month")
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0]
  })
  const [isGenerating, setIsGenerating] = useState(false)

  // Filter bills by date range
  const filteredBills = bills.filter((bill) => {
    const billDate = new Date(bill.createdAt)
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Include the entire end day
    return billDate >= start && billDate <= end
  })

  // Prepare data for charts
  const prepareSalesData = () => {
    // Group by date
    const salesByDate = filteredBills.reduce((acc, bill) => {
      const date = new Date(bill.createdAt).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = { date, sales: 0, revenue: 0, tax: 0 }
      }
      acc[date].sales += 1
      acc[date].revenue += bill.total
      acc[date].tax += bill.gstAmount
      return acc
    }, {})

    return Object.values(salesByDate)
  }

  const prepareProductData = () => {
    // Group by product
    const salesByProduct = {}

    filteredBills.forEach((bill) => {
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

  const prepareCategoryData = () => {
    // Group by category
    const salesByCategory = {}

    filteredBills.forEach((bill) => {
      bill.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        const category = product ? product.category : "Other"

        if (!salesByCategory[category]) {
          salesByCategory[category] = { name: category, value: 0 }
        }
        salesByCategory[category].value += item.price * item.quantity
      })
    })

    return Object.values(salesByCategory)
  }

  // Calculate summary metrics
  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total, 0)
  const totalSales = filteredBills.length
  const totalTax = filteredBills.reduce((sum, bill) => sum + bill.gstAmount, 0)
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range)
    const today = new Date()
    const start = new Date()

    switch (range) {
      case "week":
        start.setDate(today.getDate() - 7)
        break
      case "month":
        start.setMonth(today.getMonth() - 1)
        break
      case "quarter":
        start.setMonth(today.getMonth() - 3)
        break
      case "year":
        start.setFullYear(today.getFullYear() - 1)
        break
      default:
        start.setMonth(today.getMonth() - 1)
    }

    setStartDate(start.toISOString().split("T")[0])
    setEndDate(today.toISOString().split("T")[0])
  }

  // Add this function to the ReportsPage component

  // Generate and download report
  const handleGenerateReport = () => {
    setIsGenerating(true)
    showToast("info", "Generating report...")

    try {
      // Create a simple CSV report
      const headers = "Date,Invoice,Customer,Amount,Tax\n"
      const rows = filteredBills
        .map(
          (bill) =>
            `${new Date(bill.createdAt).toLocaleDateString()},${bill.billNumber},${bill.customerName || "Walk-in"},${bill.total},${bill.gstAmount}`,
        )
        .join("\n")

      const csvContent = headers + rows

      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)

      // Create a link and trigger download
      const a = document.createElement("a")
      a.href = url
      a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setIsGenerating(false)
        showToast("success", "Report downloaded successfully")
      }, 100)
    } catch (error) {
      console.error("Error generating report:", error)
      setIsGenerating(false)
      showToast("error", "Failed to generate report. Please try again.")
    }
  }

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

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
          <h3 className="text-xl font-medium">Reports</h3>
          <div className="flex space-x-2">
            <HomeButton />
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isGenerating ? "Generating..." : "Export Report"}</span>
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">Date Range:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDateRangeChange("week")}
              className={`px-3 py-1.5 rounded-md ${
                dateRange === "week" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => handleDateRangeChange("month")}
              className={`px-3 py-1.5 rounded-md ${
                dateRange === "month" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => handleDateRangeChange("quarter")}
              className={`px-3 py-1.5 rounded-md ${
                dateRange === "quarter" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Last Quarter
            </button>
            <button
              onClick={() => handleDateRangeChange("year")}
              className={`px-3 py-1.5 rounded-md ${
                dateRange === "year" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Last Year
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">₹{totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Sales</p>
                <p className="text-2xl font-bold mt-1">{totalSales}</p>
              </div>
              <BarChart2 className="h-6 w-6 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-600 font-medium">Average Order Value</p>
                <p className="text-2xl font-bold mt-1">₹{averageOrderValue.toFixed(2)}</p>
              </div>
              <LineChart className="h-6 w-6 text-purple-500" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Total Tax Collected</p>
                <p className="text-2xl font-bold mt-1">₹{totalTax.toFixed(2)}</p>
              </div>
              <PieChart className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="mb-6 border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("sales")}
              className={`pb-4 px-1 ${
                activeTab === "sales" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              Sales Report
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-4 px-1 ${
                activeTab === "products" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              Product Performance
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-4 px-1 ${
                activeTab === "categories" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              Category Analysis
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="mb-6">
          {activeTab === "sales" && (
            <div>
              <h4 className="text-lg font-medium mb-4">Sales Trend</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={prepareSalesData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" />
                    <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#82ca9d" name="Sales Count" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <h4 className="text-lg font-medium mb-4">Top 5 Products by Revenue</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareProductData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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

          {activeTab === "categories" && (
            <div>
              <h4 className="text-lg font-medium mb-4">Sales by Category</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={prepareCategoryData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div>
          <h4 className="text-lg font-medium mb-4">Detailed Data</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.billNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.customerName || "Walk-in Customer"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{bill.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{bill.gstAmount.toFixed(2)}</td>
                  </tr>
                ))}

                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No data available for the selected date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

