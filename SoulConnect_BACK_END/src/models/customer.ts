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
    ambition: String,
    health_report: mongoose.Schema.Types.Mixed,
    family_photos: mongoose.Schema.Types.Mixed,
    horoscopeDetails: mongoose.Schema.Types.Mixed,
    familyBackground: mongoose.Schema.Types.Mixed,
    lifeStyle: mongoose.Schema.Types.Mixed,
    partnerPreferencesDetails: mongoose.Schema.Types.Mixed,
    blood_group: String,
    additional_report_info: String,
    public_verify_command_helper: String,
    email_verified: Boolean,
    phone_verified: Boolean,
    email_otp: String,
    email_otp_expires: Date,
    phone_otp: String,
    phone_otp_expires: Date,
    createdAtTime: Date,
    modifiedAtTime: Date,
    modifiedByemail: String,
  },
  { collection: "customers", strict: false },
);

export const Customers = mongoose.model("Customers", customerSchema);
