// Client-side auth state management
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Hardcoded admin credentials
export const ADMIN_EMAIL = "debjitdey1612@gmail.com"
export const ADMIN_PASSWORD = "amimalik12345"

export type UserRole = "admin" | "manager" | "cashier" | "pending"

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  users: Array<{
    id: number
    name: string
    email: string
    password: string
    role: UserRole
  }>
  addUser: (user: { name: string; email: string; password: string; role: UserRole }) => Promise<boolean>
  removeUser: (id: number) => void
  updateUserRole: (id: number, role: UserRole) => void
}

// Add all the users from your screenshot
const initialUsers = [
  {
    id: 1,
    name: "Debjit Dey",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin" as UserRole,
  },
  {
    id: 2,
    name: "Test account",
    email: "debjit.official1612@gmail.com",
    password: "password123", // Default password, change as needed
    role: "cashier" as UserRole,
  },
  {
    id: 3,
    name: "test",
    email: "abc@gmail.com",
    password: "password123", // Default password, change as needed
    role: "cashier" as UserRole,
  },
  {
    id: 4,
    name: "Sourav Kar",
    email: "karsourav98@gmail.com", // Note: This is the correct email from your screenshot
    password: "sourav1998", // Using the password you tried to login with
    role: "manager" as UserRole,
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      users: initialUsers,
      login: async (email, password) => {
        console.log("Login attempt with:", { email, password })

        // Check if it's the admin
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
          console.log("Admin login successful")
          set({
            isAuthenticated: true,
            user: {
              id: 1,
              name: "Debjit Dey",
              email: ADMIN_EMAIL,
              role: "admin",
            },
          })
          return true
        }

        // Find the user by email (case insensitive)
        const users = get().users
        console.log("Available users:", users)

        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

        if (!user) {
          console.log("User not found with email:", email)
          console.log(
            "Available emails:",
            users.map((u) => u.email),
          )
          return false
        }

        console.log("Found user:", user)

        // Simple password check
        if (user.password === password) {
          console.log("Password matches, login successful")
          set({
            isAuthenticated: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          })
          return true
        }

        console.log("Password doesn't match. Expected:", user.password, "Got:", password)
        return false
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
        })
      },
      addUser: async (userData) => {
        const users = get().users

        // Check if email already exists
        if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
          console.log("Email already exists")
          return false
        }

        const newUser = {
          id: Math.max(0, ...users.map((u) => u.id)) + 1,
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
        }

        console.log("Adding new user:", newUser)

        // Update the users array with the new user
        const updatedUsers = [...users, newUser]
        set({ users: updatedUsers })

        console.log("Updated users list:", updatedUsers)
        return true
      },
      removeUser: (id) => {
        // Don't allow removing the admin user
        if (id === 1) return

        const users = get().users
        const updatedUsers = users.filter((u) => u.id !== id)
        set({ users: updatedUsers })
        console.log("User removed. Updated users:", updatedUsers)
      },
      updateUserRole: (id, role) => {
        const users = get().users
        const updatedUsers = users.map((u) => (u.id === id ? { ...u, role } : u))
        set({ users: updatedUsers })
        console.log("User role updated. Updated users:", updatedUsers)
      },
    }),
    {
      name: "auth-storage",
      // Make sure storage is working properly
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name)
          console.log("Getting from storage:", name, item)
          return item
        },
        setItem: (name, value) => {
          console.log("Setting to storage:", name, value)
          localStorage.setItem(name, value)
        },
        removeItem: (name) => {
          console.log("Removing from storage:", name)
          localStorage.removeItem(name)
        },
      },
    },
  ),
)

