import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  } catch (error) {
    console.error("Error hashing password:", error)
    // Fallback to simple hashing for client-side
    return `simple-hash-${Date.now()}-${password}`
  }
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Check if it's our simple hash fallback
    if (hashedPassword.startsWith("simple-hash-")) {
      const parts = hashedPassword.split("-")
      if (parts.length >= 3) {
        // Extract the original password from the hash
        const originalPassword = parts.slice(2).join("-")
        return password === originalPassword
      }
      return false
    }

    // Use bcrypt for proper comparison
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Error comparing passwords:", error)
    // Fallback for hardcoded admin
    if (hashedPassword === "admin123") {
      return password === "amimalik12345"
    }
    return false
  }
}

