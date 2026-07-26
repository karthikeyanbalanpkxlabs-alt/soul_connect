import { Request, Response } from "express";
import { Subscription } from "../models/subscription";

export async function handleSubscriptionCreate(req: Request, res: Response) {
  try {
    const { type, name, price, currency_type, plan, feature, most_popluar, active } = req.body;
    
    if (!type || !name || !price) {
      return res.status(400).json({ error: "Missing required fields (type, name, or price)" });
    }

    const existingName = await Subscription.findOne({ name });
    if (existingName) {
      return res.status(400).json({ error: "Plan name already exists." });
    }

    const existingPrice = await Subscription.findOne({ price: price.toString() });
    if (existingPrice) {
      return res.status(400).json({ error: "Plan price already exists." });
    }

    const newSub = new Subscription({
      type,
      name,
      price: price.toString(),
      currency_type: currency_type || "₹",
      plan: plan || { period_type: "month", period_value: 1 },
      feature: feature || [],
      most_popluar: !!most_popluar,
      active: active !== undefined ? !!active : true
    });

    await newSub.save();
    res.status(201).json({ success: true, message: "Subscription created successfully", data: newSub });
  } catch (err: any) {
    console.error("subscription_create error:", err);
    res.status(500).json({ error: err.message || "Failed to create subscription" });
  }
}

export async function handleSubscriptionEdit(req: Request, res: Response) {
  try {
    const { id, type, name, price, currency_type, plan, feature, most_popluar, active } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing subscription ID (id) in request body" });
    }

    if (name !== undefined) {
      const existingName = await Subscription.findOne({ name, _id: { $ne: id } });
      if (existingName) {
        return res.status(400).json({ error: "Plan name already exists." });
      }
    }

    if (price !== undefined) {
      const existingPrice = await Subscription.findOne({ price: price.toString(), _id: { $ne: id } });
      if (existingPrice) {
        return res.status(400).json({ error: "Plan price already exists." });
      }
    }

    const updateFields: any = {};
    if (type !== undefined) updateFields.type = type;
    if (name !== undefined) updateFields.name = name;
    if (price !== undefined) updateFields.price = price.toString();
    if (currency_type !== undefined) updateFields.currency_type = currency_type;
    if (plan !== undefined) updateFields.plan = plan;
    if (feature !== undefined) updateFields.feature = feature;
    if (most_popluar !== undefined) updateFields.most_popluar = !!most_popluar;
    if (active !== undefined) updateFields.active = !!active;

    const updatedSub = await Subscription.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedSub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.status(200).json({ success: true, message: "Subscription updated successfully", data: updatedSub });
  } catch (err: any) {
    console.error("subscription_edit error:", err);
    res.status(500).json({ error: err.message || "Failed to update subscription" });
  }
}

export async function handleSubscriptionGet(req: Request, res: Response) {
  try {
    const subscriptions = await Subscription.find({});
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (err: any) {
    console.error("subscription get error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch subscriptions" });
  }
}
