import { NextResponse } from "next/server"
import User from "@/models/User"
import dbConnect from "@/lib/db"
import { hash } from "bcryptjs"

export async function GET(request: Request) {
  try {
    // Check if this is a development environment or has a special secret
    const url = new URL(request.url)
    const secret = url.searchParams.get("secret")

    // Only allow this in development or with the correct secret
    if (process.env.NODE_ENV !== "development" && secret !== process.env.SETUP_SECRET) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    // Connect to the database
    await dbConnect()

    // Admin email - this is your email
    const adminEmail = "debjitdey1612@gmail.com"

    // Create a secure password (or use a provided one)
    const password = url.searchParams.get("password") || "admin123"
    const hashedPassword = await hash(password, 12)

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (existingAdmin) {
      // Update admin permissions and password
      await User.updateOne(
        { email: adminEmail },
        {
          role: "admin",
          authorized: true,
          password: hashedPassword,
          updatedAt: new Date(),
        },
      )

      return NextResponse.json({
        success: true,
        message: "Admin user updated successfully",
        user: {
          email: adminEmail,
          role: "admin",
          authorized: true,
        },
        password: password, // Return the plain password for initial setup
      })
    } else {
      // Create new admin user
      await User.create({
        name: "Debjit Dey",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        authorized: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        message: "Admin user created successfully",
        user: {
          email: adminEmail,
          role: "admin",
          authorized: true,
        },
        password: password, // Return the plain password for initial setup
      })
    }
  } catch (error) {
    console.error("Error setting up admin:", error)
    return NextResponse.json(
      {
        error: "Failed to set up admin user",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

