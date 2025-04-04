"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/providers/toast-provider"

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  productId: number | null
}

export default function EditProductModal({ isOpen, onClose, productId }: EditProductModalProps) {
  const { products, updateProduct } = useStore()
  const { showToast } = useToast()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("")
  const [gst, setGst] = useState("18")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    price?: string
    stock?: string
    category?: string
  }>({})

  // Load product data when productId changes
  useEffect(() => {
    if (productId) {
      const product = products.find((p) => p.id === productId)
      if (product) {
        setName(product.name)
        setPrice(product.price.toString())
        setStock(product.stock.toString())
        setCategory(product.category)
        setGst(product.gst.toString())
      }
    }
  }, [productId, products, isOpen])

  const validateForm = () => {
    const newErrors: {
      name?: string
      price?: string
      stock?: string
      category?: string
    } = {}

    if (!name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!price) {
      newErrors.price = "Price is required"
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "Price must be a valid positive number"
    }

    if (!stock) {
      newErrors.stock = "Stock quantity is required"
    } else if (isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = "Stock quantity must be a valid positive number"
    }

    if (!category) {
      newErrors.category = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !productId) return

    setIsSubmitting(true)

    try {
      updateProduct(productId, {
        name,
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock),
        category,
        gst: Number.parseInt(gst),
      })

      showToast("success", `Product "${name}" updated successfully`)
      onClose()
    } catch (error) {
      console.error("Error updating product:", error)
      showToast("error", "Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Edit Product</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full border ${errors.price ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={`w-full border ${errors.stock ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full border ${errors.category ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home">Home</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
              <select
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
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
      </div>
    </div>
  )
}

