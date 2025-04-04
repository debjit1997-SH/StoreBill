import { create } from "zustand"
import { persist } from "zustand/middleware"
import { sampleCustomers, sampleProducts, sampleBills } from "./sample-data"

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
}

export interface Product {
  id: number
  name: string
  price: number
  stock: number
  category: string
  gst: number
  createdAt: string
}

export interface BillItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  gst: number
}

export interface Bill {
  id: number
  billNumber: string
  customerId: number | null
  customerName: string | null
  items: BillItem[]
  subtotal: number
  gstAmount: number
  discount: number
  discountAmount: number
  total: number
  paymentMethod: "cash" | "card" | "upi"
  notes: string
  createdAt: string
  status: "paid" | "pending" | "cancelled"
}

export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "manager" | "cashier"
  status: "active" | "inactive"
  createdAt: string
}

export interface Currency {
  code: string
  name: string
  symbol: string
  exchangeRate: number // Relative to base currency (INR)
}

// Update the StoreSettings interface to make currency properties optional with defaults
export interface StoreSettings {
  name: string
  address: string
  phone: string
  email: string
  gst: string
  logo: string | null
  qrCode: string | null
  primaryColor: string
  enableGst: boolean
  splitGst: boolean
  enableTcs: boolean
  enableTds: boolean
  currency: Currency // Make required with default
  availableCurrencies: Currency[] // Make required with default
}

interface StoreState {
  customers: Customer[]
  products: Product[]
  bills: Bill[]
  users: User[]
  settings: StoreSettings
  nextCustomerId: number
  nextProductId: number
  nextBillId: number
  nextUserId: number
  nextBillNumber: number

  // Customer actions
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Customer
  updateCustomer: (id: number, customer: Partial<Omit<Customer, "id" | "createdAt">>) => void
  deleteCustomer: (id: number) => void

  // Product actions
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Product
  updateProduct: (id: number, product: Partial<Omit<Product, "id" | "createdAt">>) => void
  deleteProduct: (id: number) => void

  // Bill actions
  addBill: (bill: Omit<Bill, "id" | "billNumber" | "createdAt">) => Bill
  updateBill: (id: number, bill: Partial<Omit<Bill, "id" | "billNumber" | "createdAt">>) => void
  deleteBill: (id: number) => void

  // User actions
  addUser: (user: Omit<User, "id" | "createdAt">) => User
  updateUser: (id: number, user: Partial<Omit<User, "id" | "createdAt">>) => void
  deleteUser: (id: number) => void

  // Settings actions
  updateSettings: (settings: Partial<StoreSettings>) => void

  // Currency actions
  addCurrency: (currency: Currency) => void
  updateCurrency: (code: string, currency: Partial<Currency>) => void
  deleteCurrency: (code: string) => void
  setActiveCurrency: (code: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      customers: sampleCustomers,
      products: sampleProducts,
      bills: sampleBills,
      users: [
        {
          id: 1,
          name: "Debjit Dey",
          email: "debjitdey1612@gmail.com",
          role: "admin",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ],
      // In the store initialization, ensure defaults are set
      settings: {
        name: "My Store",
        address: "123 Store Street, City",
        phone: "1234567890",
        email: "store@example.com",
        gst: "22AAAAA0000A1Z5",
        logo: null,
        qrCode: null,
        primaryColor: "#4F46E5",
        enableGst: true,
        splitGst: true,
        enableTcs: false,
        enableTds: false,
        currency: {
          code: "INR",
          name: "Indian Rupee",
          symbol: "₹",
          exchangeRate: 1,
        },
        availableCurrencies: [
          {
            code: "INR",
            name: "Indian Rupee",
            symbol: "₹",
            exchangeRate: 1,
          },
          {
            code: "USD",
            name: "US Dollar",
            symbol: "$",
            exchangeRate: 0.012,
          },
          {
            code: "EUR",
            name: "Euro",
            symbol: "€",
            exchangeRate: 0.011,
          },
          {
            code: "GBP",
            name: "British Pound",
            symbol: "£",
            exchangeRate: 0.0095,
          },
        ],
      },
      nextCustomerId: sampleCustomers.length + 1,
      nextProductId: sampleProducts.length + 1,
      nextBillId: sampleBills.length + 1,
      nextUserId: 2, // Start from 2 since we already have one admin user
      nextBillNumber: sampleBills.length + 1,

      // Customer actions
      addCustomer: (customer) => {
        const newCustomer = {
          ...customer,
          id: get().nextCustomerId,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          customers: [...state.customers, newCustomer],
          nextCustomerId: state.nextCustomerId + 1,
        }))

        return newCustomer
      },

      updateCustomer: (id, customer) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...customer } : c)),
        }))
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }))
      },

      // Product actions
      addProduct: (product) => {
        const newProduct = {
          ...product,
          id: get().nextProductId,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          products: [...state.products, newProduct],
          nextProductId: state.nextProductId + 1,
        }))

        return newProduct
      },

      updateProduct: (id, product) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...product } : p)),
        }))
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }))
      },

      // Bill actions
      addBill: (bill) => {
        const billNumber = `INV-${String(get().nextBillNumber).padStart(3, "0")}`

        const newBill = {
          ...bill,
          id: get().nextBillId,
          billNumber,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          bills: [...state.bills, newBill],
          nextBillId: state.nextBillId + 1,
          nextBillNumber: state.nextBillNumber + 1,
        }))

        // Update product stock
        bill.items.forEach((item) => {
          const product = get().products.find((p) => p.id === item.productId)
          if (product) {
            get().updateProduct(product.id, {
              stock: product.stock - item.quantity,
            })
          }
        })

        return newBill
      },

      updateBill: (id, bill) => {
        set((state) => ({
          bills: state.bills.map((b) => (b.id === id ? { ...b, ...bill } : b)),
        }))
      },

      deleteBill: (id) => {
        set((state) => ({
          bills: state.bills.filter((b) => b.id !== id),
        }))
      },

      // User actions
      addUser: (user) => {
        const newUser = {
          ...user,
          id: get().nextUserId,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          users: [...state.users, newUser],
          nextUserId: state.nextUserId + 1,
        }))

        return newUser
      },

      updateUser: (id, user) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...user } : u)),
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }))
      },

      // Settings actions
      updateSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        }))
      },

      // Currency actions
      addCurrency: (currency) => {
        set((state) => ({
          settings: {
            ...state.settings,
            availableCurrencies: [...(state.settings.availableCurrencies || []), currency],
          },
        }))
      },

      updateCurrency: (code, currency) => {
        set((state) => ({
          settings: {
            ...state.settings,
            availableCurrencies: (state.settings.availableCurrencies || []).map((c) =>
              c.code === code ? { ...c, ...currency } : c,
            ),
            // If active currency is updated, update it too
            currency:
              state.settings.currency?.code === code
                ? { ...state.settings.currency, ...currency }
                : state.settings.currency,
          },
        }))
      },

      deleteCurrency: (code) => {
        // Don't allow deleting the base currency (INR)
        if (code === "INR") return

        set((state) => ({
          settings: {
            ...state.settings,
            availableCurrencies: (state.settings.availableCurrencies || []).filter((c) => c.code !== code),
            // If active currency is deleted, revert to INR
            currency:
              state.settings.currency?.code === code
                ? (state.settings.availableCurrencies || []).find((c) => c.code === "INR") ||
                  (state.settings.availableCurrencies || [])[0] || {
                    code: "INR",
                    name: "Indian Rupee",
                    symbol: "₹",
                    exchangeRate: 1,
                  }
                : state.settings.currency,
          },
        }))
      },

      setActiveCurrency: (code) => {
        const currency = get().settings.availableCurrencies?.find((c) => c.code === code)
        if (currency) {
          set((state) => ({
            settings: {
              ...state.settings,
              currency,
            },
          }))
        }
      },
    }),
    {
      name: "store-storage",
    },
  ),
)

