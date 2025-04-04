import Link from "next/link"
import { ShoppingCart, ArrowRight, CheckCircle, CreditCard, BarChart2, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600 mr-2" />
            <span className="font-bold text-2xl">StoreBill</span>
          </div>
          <nav className="space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-blue-600">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-blue-600">
              Pricing
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-blue-600">
              About
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-blue-600">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-6">Streamline Your Store Billing</h1>
              <p className="text-lg text-gray-600 mb-8">
                A complete billing solution for retail stores. Manage inventory, create invoices, track sales, and more.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-800 font-medium rounded-md border hover:bg-gray-50 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
              <ShoppingCart className="h-32 w-32 text-blue-600" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Features</h2>
              <p className="mt-4 text-xl text-gray-600">Everything you need to manage your store billing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Easy Billing</h3>
                <p className="text-gray-600">
                  Create professional invoices and bills in seconds with our intuitive interface.
                </p>
              </div>

              <div className="p-6 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Inventory Management</h3>
                <p className="text-gray-600">Keep track of your products, stock levels, and get low stock alerts.</p>
              </div>

              <div className="p-6 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Reports & Analytics</h3>
                <p className="text-gray-600">
                  Get insights into your sales, revenue, and customer behavior with detailed reports.
                </p>
              </div>

              <div className="p-6 border rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Customization</h3>
                <p className="text-gray-600">
                  Customize your store details, logo, and billing format to match your brand.
                </p>
              </div>

              <div className="p-6 border rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">GST Compliance</h3>
                <p className="text-gray-600">
                  Generate GST compliant invoices with SGST, CGST, and other tax calculations.
                </p>
              </div>

              <div className="p-6 border rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Customer Management</h3>
                <p className="text-gray-600">
                  Maintain customer database with purchase history and contact information.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-bold text-xl">StoreBill</span>
            </div>
            <p className="text-gray-500">© 2023 StoreBill. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

