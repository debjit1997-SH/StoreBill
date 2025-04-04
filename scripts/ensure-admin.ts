import mongoose from "mongoose"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

// Define the User schema to match your application
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String,
  role: String,
  authorized: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Connect to MongoDB
async function ensureAdmin() {
  try {
    console.log("Connecting to MongoDB...")

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables")
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB successfully!")

    // Get the User model
    const User = mongoose.models.User || mongoose.model("User", UserSchema, "users")

    // Check if admin already exists - IMPORTANT: Replace with your email
    const adminEmail = "debjitdey1612@gmail.com" // Replace with your actual email if different
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (existingAdmin) {
      console.log("Admin user already exists. Updating permissions...")

      // Update the existing user to be an admin
      await User.updateOne(
        { email: adminEmail },
        {
          role: "admin",
          authorized: true,
          updatedAt: new Date(),
        },
      )

      console.log("Admin user updated successfully!")
    } else {
      console.log("Creating new admin user...")

      // Create a new admin user
      await User.create({
        name: "Debjit Dey",
        email: "debjitdey1612@gmail.com",
        role: "admin",
        authorized: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log("Admin user created successfully!")
    }

    // List all users in the database
    const users = await User.find({})
    console.log("All users in database:")
    console.table(
      users.map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        authorized: u.authorized,
      })),
    )

    console.log("Setup completed successfully!")
  } catch (error) {
    console.error("Error setting up admin user:", error)
  } finally {
    // Close the connection
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the setup
ensureAdmin()

