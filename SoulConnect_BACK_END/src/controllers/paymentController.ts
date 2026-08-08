import { Request, Response } from "express";
import { Customers } from "../models/customer";

/**
 * Handle payment creation and record transaction details for customer by email
 * Supports both Positive (Success/Paid) and Negative (Failed/Declined/Cancelled) flows.
 */
export async function handleMakePayment(req: Request, res: Response) {
  try {
    const {
      email,
      id,
      _id,
      customer_id,
      keycloakId,
      plan,
      subscription_type,
      amount,
      total_amount,
      tax,
      discount,
      payment_method,
      mode,
      payment_id,
      transaction_id,
      order_id,
      invoice_no,
      payment_status,
      status,
      payment_type,
      purchase_date,
      plan_start,
      expired_date,
      plan_end,
      error_code,
      error_description,
      failure_reason,
    } = req.body;

    const targetEmail = email ? String(email).trim() : "";
    let query: any = {};

    if (targetEmail) {
      query.email = { $regex: `^${targetEmail}$`, $options: "i" };
    } else if (id || _id) {
      query._id = id || _id;
    } else if (customer_id) {
      query.customer_id = customer_id;
    } else if (keycloakId) {
      query.keycloakId = keycloakId;
    } else {
      return res.status(400).json({
        error:
          "Missing required identifier: 'email', 'id', or 'customer_id' in request body",
      });
    }

    const customer = await Customers.findOne(query);
    if (!customer) {
      return res.status(404).json({
        error: `Customer not found for identifier: ${targetEmail || id || _id || customer_id || keycloakId}`,
      });
    }

    const now = new Date();
    const payStatusRaw = String(
      payment_status || status || "success",
    ).toLowerCase();

    // Check if flow is positive or negative
    const isFailedStatus =
      payStatusRaw === "failed" ||
      payStatusRaw === "failure" ||
      payStatusRaw === "cancelled" ||
      payStatusRaw === "declined" ||
      payStatusRaw === "rejected" ||
      payStatusRaw === "error";

    const isPaymentSuccessful = !isFailedStatus;
    const finalPaymentStatus = isPaymentSuccessful
      ? payment_status || status || "success"
      : payment_status || status || "failed";

    const planName =
      plan ||
      subscription_type ||
      customer.get("subscription_type") ||
      "Standard";
    const numAmount = Number(amount || total_amount || 0);
    const numTax = Number(tax || 0);
    const numDiscount = Number(discount || 0);
    const finalTotalAmount = Number(
      total_amount !== undefined
        ? total_amount
        : numAmount + numTax - numDiscount,
    );

    const startDate = purchase_date || plan_start || now.toISOString();

    // Default expired date is 1 year from purchase if not specified
    let endDate = expired_date || plan_end;
    if (!endDate) {
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);
      endDate = expiry.toISOString();
    }

    const txnId =
      transaction_id ||
      payment_id ||
      `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const invNo = invoice_no || `INV-${Date.now().toString(36).toUpperCase()}`;
    const ordId = order_id || `ORD-${Date.now().toString(36).toUpperCase()}`;
    const payMethod = payment_method || mode || "Online";
    const payType = payment_type || "online";

    let currentHistory = Array.isArray(customer.get("transaction.history"))
      ? customer.get("transaction.history")
      : [];

    // POSITIVE FLOW: mark previous plans as false & set new history record current_plan: true
    // NEGATIVE FLOW: keep existing active plan intact & set new history record current_plan: false
    if (isPaymentSuccessful) {
      currentHistory = currentHistory.map((h: any) => ({
        ...h,
        current_plan: false,
      }));
    }

    const summaryData: any = {
      invoice_no: invNo,
      order_id: ordId,
      payment_id: txnId,
      payment_method: payMethod,
      payment_status: finalPaymentStatus,
      payment_type: payType,
      amount: numAmount,
      tax: numTax,
      discount: numDiscount,
      total_amount: finalTotalAmount,
      transaction_date: startDate,
    };

    if (!isPaymentSuccessful) {
      summaryData.error_code = error_code || "PAYMENT_FAILED";
      summaryData.error_description =
        error_description ||
        failure_reason ||
        "Payment processing failed or was declined.";
    }

    const newHistoryRecord = {
      current_plan: isPaymentSuccessful,
      plan: planName,
      purchase_date: startDate,
      expired_date: endDate,
      summary: summaryData,
    };

    currentHistory.push(newHistoryRecord);

    // Also update legacy transaction array format for compatibility
    let legacyTransactions = Array.isArray(customer.get("transaction"))
      ? customer.get("transaction")
      : [];

    const newLegacyRecord: any = {
      payment_type: payType,
      transaction_id: txnId,
      transaction_date: startDate,
      status: finalPaymentStatus,
      amount: String(finalTotalAmount),
      currency_type: "₹",
      tax: { gst: "", cgst: "" },
      plan: planName,
      mode: payMethod,
      plan_start: startDate,
      plan_end: endDate,
    };

    if (!isPaymentSuccessful) {
      newLegacyRecord.error_code = error_code || "PAYMENT_FAILED";
      newLegacyRecord.error_description =
        error_description ||
        failure_reason ||
        "Payment processing failed or was declined.";
    }

    legacyTransactions.push(newLegacyRecord);

    // Update customer document
    customer.set("transaction", legacyTransactions);
    customer.set("transaction.history", currentHistory);

    // Only update subscription_type on top-level customer document if payment is successful
    if (isPaymentSuccessful) {
      customer.set("subscription_type", planName);
    }

    customer.set("modifiedAtTime", now);

    await customer.save();

    if (isPaymentSuccessful) {
      return res.status(200).json({
        success: true,
        message: "Payment transaction recorded successfully",
        data: {
          customer_id: customer._id,
          email: customer.get("email"),
          subscription_type: planName,
          transaction: newHistoryRecord,
        },
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Payment failed. Failed transaction recorded.",
        data: {
          customer_id: customer._id,
          email: customer.get("email"),
          subscription_type: customer.get("subscription_type") || "None",
          transaction: newHistoryRecord,
          error_code: summaryData.error_code,
          error_description: summaryData.error_description,
        },
      });
    }
  } catch (err: any) {
    console.error("makePayment error:", err);
    res.status(500).json({
      error: err.message || "Failed to process payment transaction",
    });
  }
}
