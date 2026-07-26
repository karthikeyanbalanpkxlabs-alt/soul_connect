import mongoose from "mongoose";

const userInfoSchema = new mongoose.Schema(
  {
    keycloakId: { type: String, unique: true }, // Linking to Keycloak ID
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "User" },
    status: { type: String, default: "Active" },
  },
  { collection: "user_info", timestamps: true },
);

export const UserInfo = mongoose.model("UserInfo", userInfoSchema);
