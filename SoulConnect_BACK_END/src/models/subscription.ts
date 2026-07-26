import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {},
  { collection: "subscription", strict: false },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
