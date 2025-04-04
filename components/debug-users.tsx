"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/auth-state"

export default function DebugUsers() {
  const { users } = useAuthStore()
  const [showUsers, setShowUsers] = useState(false)

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <button onClick={() => setShowUsers(!showUsers)} className="text-blue-600 hover:text-blue-800 text-sm">
        {showUsers ? "Hide Debug Info" : "Show Debug Info"}
      </button>

      {showUsers && (
        <div className="mt-2">
          <h4 className="text-sm font-medium">Available Users:</h4>
          <div className="mt-1 text-xs text-gray-600 space-y-1">
            {users.map((user) => (
              <div key={user.id} className="p-2 bg-white rounded border">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Password:</strong> {user.passwordHash}
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

