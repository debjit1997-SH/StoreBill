import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// import GoogleProvider from "next-auth/providers/google"
// import clientPromise from "@/lib/mongodb"
// import { MongoDBAdapter } from "@auth/mongodb-adapter"
// import User from "@/models/User"
// import mongoose from "mongoose"
// import { compare } from "bcryptjs"
// import dbConnect from "@/lib/db"

// Debug function to log important information
// const debug = (message: string, data?: any) => {
//   if (process.env.NODE_ENV === "development" || process.env.DEBUG === "true") {
//     console.log(`[NextAuth] ${message}`, data ? data : "")
//   }
// }

// Hardcoded admin credentials
const ADMIN_EMAIL = "debjitdey1612@gmail.com"
const ADMIN_PASSWORD = "amimalik12345"

export const authOptions = {
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || "",
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    // }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Check if credentials match the hardcoded admin credentials
        if (credentials?.email === ADMIN_EMAIL && credentials?.password === ADMIN_PASSWORD) {
          // Return the admin user
          return {
            id: "admin-user",
            name: "Debjit Dey",
            email: ADMIN_EMAIL,
            role: "admin",
            authorized: true,
            image: null,
          }
        }

        // If credentials don't match, return null (authentication fails)
        return null
      },
    }),
  ],
  // adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to JWT token when user signs in
      if (user) {
        token.role = user.role
        token.authorized = user.authorized
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Add user data to session
      if (session.user) {
        session.user.id = token.sub || "admin-user"
        session.user.role = (token.role as string) || "admin"
        session.user.authorized = (token.authorized as boolean) || true
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // debug("Redirect callback", { url, baseUrl })

      // Handle redirects properly
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  debug: process.env.NODE_ENV === "development" || process.env.DEBUG === "true",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

