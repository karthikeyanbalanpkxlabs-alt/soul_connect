import { Request, Response } from "express";
import { Customers } from "../models/customer";
import { Subscription } from "../models/subscription";

export async function handleDashboardAnalytics(req: Request, res: Response) {
  try {
    const totalCustomers = await Customers.countDocuments();
    const approvedCustomers = await Customers.countDocuments({
      public_verify: true,
    });
    const pendingCustomers = await Customers.countDocuments({
      public_verify: false,
    });

    const maleCount = await Customers.countDocuments({
      gender: { $regex: "^male$", $options: "i" },
    });
    const femaleCount = await Customers.countDocuments({
      gender: { $regex: "^female$", $options: "i" },
    });

    const managerCount = await Customers.countDocuments({
      role: { $regex: "manager", $options: "i" },
    });
    const customerRoleCount = await Customers.countDocuments({
      role: { $regex: "customer", $options: "i" },
    });

    const totalSubscriptions = await Subscription.countDocuments();

    // Aggregation for transactions count and total revenue
    const transactionStats = await Customers.aggregate([
      { $match: { "transaction.history": { $exists: true, $not: { $size: 0 } } } },
      { $unwind: "$transaction.history" },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $ifNull: [
                "$transaction.history.summary.total_amount",
                { $ifNull: ["$transaction.history.summary.amount", 0] }
              ]
            }
          }
        }
      }
    ]);
    const totalTransactions = transactionStats[0]?.count || 0;
    const totalRevenue = transactionStats[0]?.totalRevenue || 0;

    // Aggregation for 5 most recent transactions across all customers
    const recentTransactions = await Customers.aggregate([
      { $match: { "transaction.history": { $exists: true, $not: { $size: 0 } } } },
      { $unwind: "$transaction.history" },
      {
        $project: {
          _id: 1,
          first_name: { $ifNull: ["$first_name", "$firstName"] },
          last_name: { $ifNull: ["$last_name", "$lastName"] },
          email: 1,
          transaction: "$transaction.history"
        }
      },
      {
        $sort: {
          "transaction.purchase_date": -1,
          "transaction.summary.transaction_date": -1
        }
      },
      { $limit: 5 }
    ]);

    const recentCustomers = await Customers.find().sort({ _id: -1 }).limit(6);

    const subscriptionBreakdown = await Customers.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$subscription_type", "Guest"] },
          count: { $sum: 1 },
        },
      },
    ]);

    const districtBreakdown = await Customers.aggregate([
      { $match: { district: { $exists: true, $ne: "" } } },
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        approvedCustomers,
        pendingCustomers,
        maleCount,
        femaleCount,
        managerCount,
        customerRoleCount,
        totalSubscriptions,
        totalTransactions,
        totalRevenue,
      },
      subscriptionBreakdown: subscriptionBreakdown.map((item) => ({
        type: String(item._id || "Guest"),
        count: item.count,
      })),
      topDistricts: districtBreakdown.map((item) => ({
        district: String(item._id),
        count: item.count,
      })),
      recentCustomers,
      recentTransactions,
    });
  } catch (err: any) {
    console.error("dashboard_analytics error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch dashboard metrics" });
  }
}
