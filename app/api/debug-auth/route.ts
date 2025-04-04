import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import mongoose from "mongoose"
import User from "@/models/User"

export async function GET(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Basic info that's safe to return to anyone
    const debugInfo: any = {
      auth: {
        authenticated: !!session,
        user: session
          ? {
              email: session.user.email,
              name: session.user.name,
              role: session.user.role,
              authorized: session.user.authorized,
            }
          : null,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Set" : "Not set",
        MONGODB_URI: process.env.MONGODB_URI ? "Set" : "Not set",
        MONGODB_DB: process.env.MONGODB_DB || "Default",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set",
      },
    }

    // Add database connection status
    try {
      // Check MongoDB connection
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_URI as string)
      }

      debugInfo.database = {
        mongoose: {
          connected: mongoose.connection.readyState === 1,
          readyState: mongoose.connection.readyState,
          status:
            ["Disconnected", "Connected", "Connecting", "Disconnecting"][mongoose.connection.readyState] || "Unknown",
        },
      }

      // Get user count
      const userCount = await User.countDocuments()
      debugInfo.database.userCount = userCount

      // Get admin users
      const adminUsers = await User.find({ role: "admin" }).lean()
      debugInfo.database.adminUsers = adminUsers.map((u) => ({
        email: u.email,
        authorized: u.authorized,
      }))
    } catch (dbError) {
      debugInfo.database = {
        error: dbError.message,
        stack: process.env.NODE_ENV === "development" ? dbError.stack : "Hidden in production",
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : "Hidden in production",
      },
      { status: 500 },
    )
  }
}

