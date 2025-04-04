"use client"

import type React from "react"

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

