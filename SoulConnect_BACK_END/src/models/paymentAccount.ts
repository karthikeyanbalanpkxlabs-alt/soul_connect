import mongoose from "mongoose";

const paymentAccountSchema = new mongoose.Schema(
  {
    account_name: { type: String, required: true },
    provider: { type: String, required: true },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "payment_account", strict: false },
);

export const PaymentAccount = mongoose.model(
  "PaymentAccount",
  paymentAccountSchema,
);
