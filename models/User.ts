import mongoose from "mongoose"

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  image: String,
  role: {
    type: String,
    enum: ["admin", "manager", "cashier", "pending"],
    default: "pending",
  },
  authorized: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Check if the model already exists to prevent overwriting
const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User

