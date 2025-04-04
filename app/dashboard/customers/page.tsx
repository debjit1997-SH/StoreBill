"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Edit, Trash2, Users } from "lucide-react"
import { useAuthStore } from "@/lib/auth-state"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/providers/toast-provider"
import AddCustomerModal from "@/components/add-customer-modal"
import Modal from "@/components/ui/modal"
import HomeButton from "@/components/home-button"

export default function CustomersPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const { customers, deleteCustomer } = useStore()
  const { showToast } = useToast()

  const [search, setSearch] = useState("")
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null)

  // Filtered customers based on search
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search) ||
      customer.email.toLowerCase().includes(search.toLowerCase()),
  )

  // Handle customer edit
  const handleEditCustomer = (id: number) => {
    setSelectedCustomerId(id)
    setIsEditCustomerModalOpen(true)
  }

  // Handle customer deletion
  const handleDeleteCustomer = (id: number) => {
    setCustomerToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteCustomer = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete)
      showToast("success", "Customer deleted successfully")
      setIsDeleteModalOpen(false)
      setCustomerToDelete(null)
    }
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
          <h3 className="text-xl font-medium flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Customers
          </h3>
          <div className="flex space-x-2">
            <HomeButton />
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEditCustomer(customer.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)} />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditCustomerModalOpen}
        onClose={() => {
          setIsEditCustomerModalOpen(false)
          setSelectedCustomerId(null)
        }}
        customerId={selectedCustomerId}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setCustomerToDelete(null)
        }}
        title="Confirm Delete"
      >
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete this customer? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false)
                setCustomerToDelete(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteCustomer}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Edit Customer Modal Component
function EditCustomerModal({ isOpen, onClose, customerId }) {
  const { customers, updateCustomer } = useStore()
  const { showToast } = useToast()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (customerId) {
      const customer = customers.find((c) => c.id === customerId)
      if (customer) {
        setName(customer.name)
        setEmail(customer.email)
        setPhone(customer.phone)
        setAddress(customer.address)
      }
    }
  }, [customerId, customers])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name || !phone) {
      showToast("error", "Name and phone are required")
      return
    }

    setIsSubmitting(true)

    try {
      updateCustomer(customerId, {
        name,
        email,
        phone,
        address,
      })

      showToast("success", "Customer updated successfully")
      onClose()
    } catch (error) {
      console.error("Error updating customer:", error)
      showToast("error", "Failed to update customer")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Customer">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

