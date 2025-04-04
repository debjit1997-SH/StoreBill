"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useAuthStore, type UserRole } from "@/lib/auth-state"
import { useToast } from "@/components/providers/toast-provider"
import AddUserModal from "@/components/add-user-modal"
import Modal from "@/components/ui/modal"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"

export default function UsersPage() {
  const { isAuthenticated, user, users, removeUser, updateUserRole } = useAuthStore()
  const router = useRouter()
  const { showToast } = useToast()

  const [search, setSearch] = useState("")
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<{ id: number; role: UserRole } | null>(null)

  // Filter users based on search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  )

  // Handle user deletion
  const handleDeleteUser = (id: number) => {
    setUserToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      removeUser(userToDelete)
      showToast("success", "User deleted successfully")
      setIsDeleteModalOpen(false)
    }
  }

  // Handle user role update
  const handleEditUser = (id: number, role: UserRole) => {
    setUserToEdit({ id, role })
    setIsEditModalOpen(true)
  }

  const confirmEditUser = () => {
    if (userToEdit) {
      updateUserRole(userToEdit.id, userToEdit.role)
      showToast("success", "User role updated successfully")
      setIsEditModalOpen(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Only admin can access this page
    if (user?.role !== "admin") {
      showToast("error", "You don't have permission to access this page")
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router, showToast])

  if (!isAuthenticated || user?.role !== "admin") {
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
          <h3 className="text-xl font-medium">Users</h3>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "manager"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEditUser(user.id, user.role)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      disabled={user.email === ADMIN_EMAIL}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={user.email === ADMIN_EMAIL}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={confirmDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User Role">
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={userToEdit?.role || "cashier"}
              onChange={(e) => setUserToEdit((prev) => (prev ? { ...prev, role: e.target.value as UserRole } : null))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={confirmEditUser} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

