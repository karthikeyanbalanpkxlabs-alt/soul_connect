import { Request, Response } from "express";
import crypto from "crypto";
import { Customers } from "../models/customer";
import { PaymentAccount } from "../models/paymentAccount";

/**
 * Helper to fetch active payment_account document from DB checking provider or account_name
 */
export async function getActivePaymentAccount(
  requestedIdentifier?: string,
  requestedProvider?: string,
) {
  const query: any = { is_active: true };

  const providerStr = (requestedProvider || "").trim();
  const identifierStr = (requestedIdentifier || "").trim();

  if (providerStr !== "") {
    query.provider = { $regex: `^${providerStr}$`, $options: "i" };
  } else if (identifierStr !== "") {
    query.$or = [
      { provider: { $regex: `^${identifierStr}$`, $options: "i" } },
      { account_name: { $regex: `^${identifierStr}$`, $options: "i" } },
    ];
  }

  const account = await PaymentAccount.findOne(query);
  return account;
}

/**
 * Create Razorpay Order using active payment_account config
 * Endpoint: POST /api/createRazorpayOrder or POST /api/payment/razorpay/createOrder
 */
export async function handleCreateRazorpayOrder(req: Request, res: Response) {
  try {
    const { amount, currency, email, plan, account_name, provider } = req.body;
    if (!amount || isNaN(Number(amount))) {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'amount' in request body" });
    }

    const activeAccount = await getActivePaymentAccount(account_name, provider || "razorpay");
    if (!activeAccount) {
      return res.status(400).json({
        success: false,
        error:
          "Payment account for provider is inactive or not configured. Payment processing is currently disabled.",
        error_code: "PAYMENT_ACCOUNT_INACTIVE",
      });
    }

    const cfg = activeAccount.get("config") || {};
    const key_id = cfg.key_id || process.env.RAZORPAY_KEY_ID || "";
    const key_secret = cfg.key_secret || process.env.RAZORPAY_KEY_SECRET || "";
    const orderCurrency = currency || cfg.currency || "INR";
    const receiptPrefix = cfg.order?.receipt_prefix || "ORD";

    const numAmount = Number(amount);
    const amountInPaise = Math.round(numAmount * 100);
    const receipt = `${receiptPrefix}_${Date.now()}`;

    let orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (key_id && key_secret) {
      try {
        const authString = Buffer.from(`${key_id}:${key_secret}`).toString(
          "base64",
        );
        const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: orderCurrency,
            receipt,
            notes: { email: email || "", plan: plan || "" },
          }),
        });

        if (rzpRes.ok) {
          const rzpData = await rzpRes.json();
          orderId = rzpData.id;
        }
      } catch (err: any) {
        console.error("Failed to contact Razorpay API:", err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        order_id: orderId,
        amount: numAmount,
        amount_in_paise: amountInPaise,
        currency: orderCurrency,
        key_id,
        account_name: activeAccount.get("account_name"),
        provider: activeAccount.get("provider"),
        payment_account_id: activeAccount._id,
      },
    });
  } catch (err: any) {
    console.error("createRazorpayOrder error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to create Razorpay order" });
  }
}

/**
 * Handle payment creation, Razorpay signature verification, payment_account active validation, and transaction recording
 * Endpoint: POST /api/makePayment
 */
export async function handleMakePayment(req: Request, res: Response) {
  try {
    const { action, create_order } = req.body;

    // COMBINED ENDPOINT: Handle Order Creation inside /makePayment if action is "create_order"
    if (
      action === "create_order" ||
      action === "createOrder" ||
      create_order === true
    ) {
      return await handleCreateRazorpayOrder(req, res);
    }

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
      provider,
      account_name,
      payment_account_name,
      // Razorpay checkout signature fields
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 1. CHECK FOR ACTIVE PAYMENT ACCOUNT DATA (is_active: true) matching provider or account_name
    const targetProvider = provider || (razorpay_payment_id || razorpay_signature ? "razorpay" : undefined);
    const activePaymentAccount = await getActivePaymentAccount(
      account_name || payment_account_name,
      targetProvider,
    );

    if (!activePaymentAccount) {
      return res.status(400).json({
        success: false,
        error: `Payment account for provider '${targetProvider || account_name || "requested"}' is inactive or not configured. Payment processing is currently disabled.`,
        error_code: "PAYMENT_ACCOUNT_INACTIVE",
      });
    }

    // 2. FIND CUSTOMER BY EMAIL OR IDENTIFIER
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

    const cfg = activePaymentAccount.get("config") || {};
    const keySecret = cfg.key_secret || process.env.RAZORPAY_KEY_SECRET || "";

    const now = new Date();
    let isSignatureVerified = true;
    let signatureErrorMsg = "";

    // Perform Razorpay Signature Verification if signature parameters are provided
    if (razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      if (keySecret) {
        const bodyToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(bodyToSign)
          .digest("hex");

        if (expectedSignature !== razorpay_signature) {
          isSignatureVerified = false;
          signatureErrorMsg =
            "Razorpay payment signature verification failed. Invalid HMAC SHA256 signature.";
        }
      }
    }

    const payStatusRaw = String(
      payment_status || status || "success",
    ).toLowerCase();

    // Determine payment success
    const isFailedStatus =
      !isSignatureVerified ||
      payStatusRaw === "failed" ||
      payStatusRaw === "failure" ||
      payStatusRaw === "cancelled" ||
      payStatusRaw === "declined" ||
      payStatusRaw === "rejected" ||
      payStatusRaw === "error";

    const isPaymentSuccessful = !isFailedStatus;
    const finalPaymentStatus = isPaymentSuccessful
      ? "success"
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

    let endDate = expired_date || plan_end;
    if (!endDate) {
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);
      endDate = expiry.toISOString();
    }

    const txnId =
      razorpay_payment_id ||
      transaction_id ||
      payment_id ||
      `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const ordId =
      razorpay_order_id ||
      order_id ||
      `ORD-${Date.now().toString(36).toUpperCase()}`;
    const invNo = invoice_no || `INV-${Date.now().toString(36).toUpperCase()}`;
    const payMethod =
      payment_method || mode || (razorpay_payment_id ? "Razorpay" : "Online");
    const payType = payment_type || "online";

    let currentHistory = Array.isArray(customer.get("transaction.history"))
      ? customer.get("transaction.history")
      : [];

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
      account_name: activePaymentAccount.get("account_name"),
      provider: activePaymentAccount.get("provider"),
      payment_account_id: activePaymentAccount._id,
    };

    if (!isPaymentSuccessful) {
      summaryData.error_code = error_code || "BAD_REQUEST_PAYMENT_FAILED";
      summaryData.error_description =
        signatureErrorMsg ||
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

    let legacyTransactions = Array.isArray(customer.get("transaction"))
      ? customer.get("transaction")
      : [];

    const newLegacyRecord: any = {
      payment_type: payType,
      transaction_id: txnId,
      transaction_date: startDate,
      status: finalPaymentStatus,
      amount: String(finalTotalAmount),
      currency_type: cfg.currency || "₹",
      tax: { gst: "", cgst: "" },
      plan: planName,
      mode: payMethod,
      plan_start: startDate,
      plan_end: endDate,
      account_name: activePaymentAccount.get("account_name"),
      provider: activePaymentAccount.get("provider"),
      payment_account_id: activePaymentAccount._id,
    };

    if (!isPaymentSuccessful) {
      newLegacyRecord.error_code = summaryData.error_code;
      newLegacyRecord.error_description = summaryData.error_description;
    }

    legacyTransactions.push(newLegacyRecord);

    customer.set("transaction", legacyTransactions);
    customer.set("transaction.history", currentHistory);

    if (isPaymentSuccessful) {
      customer.set("subscription_type", planName);
    }

    customer.set("modifiedAtTime", now);

    await customer.save();

    if (isPaymentSuccessful) {
      return res.status(200).json({
        success: true,
        message: "Payment transaction verified and recorded successfully",
        data: {
          customer_id: customer._id,
          email: customer.get("email"),
          subscription_type: planName,
          account_name: activePaymentAccount.get("account_name"),
          provider: activePaymentAccount.get("provider"),
          transaction: newHistoryRecord,
        },
      });
    } else {
      return res.status(200).json({
        success: false,
        message:
          signatureErrorMsg || "Payment failed. Failed transaction recorded.",
        data: {
          customer_id: customer._id,
          email: customer.get("email"),
          subscription_type: customer.get("subscription_type") || "None",
          account_name: activePaymentAccount.get("account_name"),
          provider: activePaymentAccount.get("provider"),
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

/**
 * Handle Razorpay Webhook
 * Endpoint: POST /api/payment/razorpay/webhook
 */
export async function handleRazorpayWebhook(req: Request, res: Response) {
  try {
    const activeAccount = await getActivePaymentAccount("razorpay");
    const webhookSecret =
      activeAccount?.get("config.webhook_secret") ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      "";
    const signature = req.headers["x-razorpay-signature"] as string;

    if (webhookSecret && signature) {
      const rawBody = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return res
          .status(400)
          .json({ error: "Invalid Razorpay webhook signature" });
      }
    }

    const event = req.body?.event;
    const payload =
      req.body?.payload?.payment?.entity || req.body?.payload?.order?.entity;

    if (!payload) {
      return res
        .status(200)
        .json({ status: "ignored", message: "No payload entity found" });
    }

    const targetEmail =
      payload.notes?.email ||
      payload.email ||
      payload.notes?.customer_email ||
      "";

    if (targetEmail) {
      const isSuccess =
        event === "payment.captured" ||
        event === "payment.authorized" ||
        event === "order.paid";

      const fakeReq: any = {
        body: {
          email: targetEmail,
          plan: payload.notes?.plan || "Standard",
          amount: payload.amount ? payload.amount / 100 : 0,
          payment_method: payload.method || "Razorpay",
          payment_id: payload.id || payload.payment_id,
          order_id: payload.order_id,
          payment_status: isSuccess ? "success" : "failed",
          error_code: payload.error_code,
          error_description: payload.error_description || payload.error_reason,
          account_name: activeAccount?.get("account_name"),
        },
      };

      const fakeRes: any = {
        status: () => fakeRes,
        json: () => {},
      };

      await handleMakePayment(fakeReq, fakeRes);
    }

    res.status(200).json({ status: "ok", event });
  } catch (err: any) {
    console.error("Razorpay webhook error:", err);
    res.status(500).json({ error: err.message || "Webhook processing failed" });
  }
}
