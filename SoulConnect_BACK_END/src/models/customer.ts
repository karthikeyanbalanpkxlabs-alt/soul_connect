import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    keycloakId: { type: String, unique: true, sparse: true },
    firstName: String,
    lastName: String,
    first_name: String,
    last_name: String,
    email: String,
    identity_proff: mongoose.Schema.Types.Mixed,
    createdAtTime: Date,
    modifiedAtTime: Date,
    modifiedByemail: String,
  },
  { collection: "customers", strict: false },
);

export const Customers = mongoose.model("Customers", customerSchema);
