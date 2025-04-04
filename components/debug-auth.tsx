"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/auth-state"

export default function DebugAuth() {
  const { users } = useAuthStore()
  const [showDebug, setShowDebug] = useState(true)

  return (
    <div className="mt-4 border-t pt-4">
      <button onClick={() => setShowDebug(!showDebug)} className="text-xs text-gray-400 hover:text-gray-600">
        {showDebug ? "Hide Debug Info" : "Show Debug Info"}
      </button>

      {showDebug && (
        <div className="mt-2 text-xs text-gray-500">
          <p>Registered Users: {users.length}</p>
          <div className="mt-1 space-y-1 max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="p-2 bg-gray-50 rounded border">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Password:</strong> {user.password}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

