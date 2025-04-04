import { NextResponse } from "next/server"
import User from "@/models/User"
import dbConnect from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Check if this is a development environment or has a special secret
    const url = new URL(request.url)
    const secret = url.searchParams.get("secret")

    // Only allow this in development or with the correct secret
    if (
      process.env.NODE_ENV !== "development" &&
      secret !== process.env.SETUP_SECRET &&
      secret !== "billing-software-setup"
    ) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    // Connect to the database
    await dbConnect()

    // Admin email - this is your email
    const adminEmail = "debjitdey1612@gmail.com"

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (existingAdmin) {
      // Update admin permissions
      await User.updateOne(
        { email: adminEmail },
        {
          role: "admin",
          authorized: true,
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
      })
    } else {
      // Create new admin user
      await User.create({
        name: "Debjit Dey",
        email: adminEmail,
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

