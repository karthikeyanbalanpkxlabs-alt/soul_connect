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

    const activeAccount = await getActivePaymentAccount(
      account_name,
      provider || "razorpay",
    );
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
      if (String(req.body.provider || "").toLowerCase() === "omniware") {
        return await handleOmniwareInitiate(req, res);
      }
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
    const targetProvider =
      provider ||
      (razorpay_payment_id || razorpay_signature ? "razorpay" : undefined);
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

/**
 * ====================================================================
 * OMNIWARE PAYMENT GATEWAY INTEGRATION (v2.0.1)
 * ====================================================================
 */

/**
 * Calculate Omniware SHA-512 Request Hash (Appendix 2 - Section 15.1.1)
 * Algorithm:
 * 1. Create a | (pipe) delimited string called hash_data with first value as the salt.
 * 2. Sort the post fields based on their keys and append non-empty values.
 * 3. Hash the hash_data string using SHA512 algorithm.
 * 4. Convert the hash to uppercase.
 */
export function generateOmniwareHash(
  parameters: Record<string, any>,
  salt: string,
): string {
  const sortedKeys = Object.keys(parameters)
    .filter((k) => k !== "hash")
    .sort();

  let hashData = salt;
  for (const key of sortedKeys) {
    const val = parameters[key];
    if (val !== undefined && val !== null) {
      const strVal = String(val).trim();
      if (strVal.length > 0) {
        hashData += `|${strVal}`;
      }
    }
  }

  return crypto
    .createHash("sha512")
    .update(hashData)
    .digest("hex")
    .toUpperCase();
}

/**
 * Verify Omniware Response Hash (Appendix 2 - Section 15.2.1)
 */
export function verifyOmniwareResponseHash(
  responseObj: Record<string, any>,
  salt: string,
): boolean {
  if (!responseObj || !responseObj.hash) {
    return false;
  }
  const cleanObj = { ...responseObj };
  delete cleanObj.hash;
  const computed = generateOmniwareHash(cleanObj, salt);
  return computed === String(responseObj.hash).trim().toUpperCase();
}

/**
 * Default fallback credentials for Omniware Test Kit
 */
const DEFAULT_OMNIWARE_CONFIG = {
  api_key:
    process.env.OMNIWARE_API_KEY || "fb6bca86-b429-4abf-a42f-824bdd29022e",
  salt: process.env.OMNIWARE_SALT || "80c67bfdf027da08de88ab5ba903fecafaab8f6d",
  merchant_id: "291499",
  api_url: process.env.OMNIWARE_API_URL || "https://pgbiz.omniware.in",
  environment: "TEST",
  currency: "INR",
};

/**
 * Initiate Omniware Payment Order and obtain payment URL (Two-Step API)
 * Endpoint: POST /api/payment/omniware/initiate or POST /api/public/payment/omniware/initiate
 */
export async function handleOmniwareInitiate(req: Request, res: Response) {
  try {
    const {
      amount,
      plan,
      email,
      name,
      phone,
      city,
      zip_code,
      country,
      description,
      return_url,
      account_name,
      frontend_redirect,
    } = req.body;

    if (!amount || isNaN(Number(amount))) {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'amount' in request body" });
    }

    const activeAccount = await getActivePaymentAccount(
      account_name,
      "omniware",
    );
    const cfg = activeAccount?.get("config") || {};

    const apiKey = cfg.api_key || cfg.key_id || DEFAULT_OMNIWARE_CONFIG.api_key;
    const salt = cfg.salt || cfg.key_secret || DEFAULT_OMNIWARE_CONFIG.salt;
    const mode = (
      cfg.environment ||
      cfg.mode ||
      DEFAULT_OMNIWARE_CONFIG.environment
    ).toUpperCase();
    const apiUrl = (cfg.api_url || DEFAULT_OMNIWARE_CONFIG.api_url).replace(
      /\/+$/,
      "",
    );

    // Generate unique order ID (max 30 chars per Omniware spec)
    const timestamp = Date.now().toString().slice(-8);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SC_${timestamp}_${rand}`;

    const numAmount = Number(amount).toFixed(2);
    const orderCurrency = cfg.currency || "INR";
    const orderDesc =
      description || `SoulConnect Matrimony - ${plan || "Membership"} Plan`;

    // Customer details
    const custEmail = (email || "customer@soulconect.com").trim();
    const custName = (name || "SoulConnect Member").trim();
    const custPhone = (phone || "9876543210").trim();
    const custCity = (city || "Chennai").trim();
    const custCountry = (country || "IND").trim();
    const custZip = (zip_code || "600001").trim();

    // Default backend callback return_url
    const backendCallbackUrl =
      return_url ||
      cfg.return_url ||
      `${req.protocol}://${req.get("host")}/api/public/payment/omniware/callback`;

    const requestParams: Record<string, string> = {
      api_key: apiKey,
      order_id: orderId,
      mode: mode,
      amount: numAmount,
      currency: orderCurrency,
      description: orderDesc,
      name: custName,
      email: custEmail,
      phone: custPhone,
      city: custCity,
      country: custCountry,
      zip_code: custZip,
      return_url: backendCallbackUrl,
      udf1: plan || "Premium",
      udf2: custEmail,
      udf3: frontend_redirect || "",
    };

    const hash = generateOmniwareHash(requestParams, salt);
    requestParams.hash = hash;

    const postBody = new URLSearchParams(requestParams).toString();
    const pgRes = await fetch(`${apiUrl}/v2/getpaymentrequesturl`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: postBody,
    });

    const pgData: any = await pgRes.json();

    if (!pgRes.ok || !pgData?.data?.url) {
      console.error("Omniware getpaymentrequesturl error response:", pgData);
      return res.status(400).json({
        success: false,
        error:
          pgData?.error?.message || "Failed to generate Omniware payment URL",
        details: pgData,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Omniware payment session created",
      data: {
        order_id: orderId,
        payment_url: pgData.data.url,
        uuid: pgData.data.uuid,
        expiry_datetime: pgData.data.expiry_datetime,
        amount: numAmount,
        currency: orderCurrency,
        account_name: activeAccount?.get("account_name") || "omniware_test",
        provider: "omniware",
      },
    });
  } catch (err: any) {
    console.error("handleOmniwareInitiate error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to initiate Omniware payment" });
  }
}

/**
 * Direct Browser 301 / 302 Redirection Endpoint
 * Endpoint: GET /api/payment/omniware/redirect or GET /api/public/payment/omniware/redirect
 * Takes parameters (query or body), calls Omniware getpaymentrequesturl, and immediately
 * sends an HTTP 301/302 redirection to the customer's browser!
 */
export async function handleOmniwareRedirect(req: Request, res: Response) {
  try {
    const params = req.method === "POST" ? req.body : req.query;
    const {
      amount,
      plan,
      email,
      name,
      phone,
      city,
      country,
      zip_code,
      description,
      return_url,
      account_name,
      frontend_redirect,
      status_code,
    } = params;

    if (!amount || isNaN(Number(amount))) {
      return res
        .status(400)
        .send("<h3>Error: Missing or invalid 'amount' parameter</h3>");
    }

    const activeAccount = await getActivePaymentAccount(
      account_name ? String(account_name) : undefined,
      "omniware",
    );
    const cfg = activeAccount?.get("config") || {};

    const apiKey = cfg.api_key || cfg.key_id || DEFAULT_OMNIWARE_CONFIG.api_key;
    const salt = cfg.salt || cfg.key_secret || DEFAULT_OMNIWARE_CONFIG.salt;
    const mode = (
      cfg.environment ||
      cfg.mode ||
      DEFAULT_OMNIWARE_CONFIG.environment
    ).toUpperCase();
    const apiUrl = (cfg.api_url || DEFAULT_OMNIWARE_CONFIG.api_url).replace(
      /\/+$/,
      "",
    );

    const timestamp = Date.now().toString().slice(-8);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SC_${timestamp}_${rand}`;

    const numAmount = Number(amount).toFixed(2);
    const orderCurrency = cfg.currency || "INR";
    const orderDesc = description
      ? String(description)
      : `SoulConnect Matrimony - ${plan || "Membership"} Plan`;

    const custEmail = (email || "customer@soulconect.com").toString().trim();
    const custName = (name || "SoulConnect Member").toString().trim();
    const custPhone = (phone || "9876543210").toString().trim();
    const custCity = (city || "Chennai").toString().trim();
    const custCountry = (country || "IND").toString().trim();
    const custZip = (zip_code || "600001").toString().trim();
    let host = req.get("host");
    host = host?.includes("local") ? host : "dev.soulconect.com";
    let protocol = req.get("host");
    protocol = req.get("host")?.includes("local") ? protocol : "https";
    const backendCallbackUrl = return_url
      ? String(return_url)
      : cfg.return_url ||
        `${protocol}://${host}/api/public/payment/omniware/callback`;

    const requestParams: Record<string, string> = {
      api_key: apiKey,
      order_id: orderId,
      mode: mode,
      amount: numAmount,
      currency: orderCurrency,
      description: orderDesc,
      name: custName,
      email: custEmail,
      phone: custPhone,
      city: custCity,
      country: custCountry,
      zip_code: custZip,
      return_url: backendCallbackUrl,
      udf1: String(plan || "Premium"),
      udf2: custEmail,
      udf3: frontend_redirect ? String(frontend_redirect) : "",
    };

    const hash = generateOmniwareHash(requestParams, salt);
    requestParams.hash = hash;

    const postBody = new URLSearchParams(requestParams).toString();
    const pgRes = await fetch(`${apiUrl}/v2/getpaymentrequesturl`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: postBody,
    });

    const pgData: any = await pgRes.json();

    if (!pgRes.ok || !pgData?.data?.url) {
      console.error("Omniware getpaymentrequesturl error in redirect:", pgData);
      return res
        .status(500)
        .send(
          `<h3>Failed to initiate payment gateway redirection</h3><p>${pgData?.error?.message || "Please try again later."}</p>`,
        );
    }

    // Determine redirect HTTP status (301 Moved Permanently or 302 Found)
    const redirectCode = status_code === "301" ? 301 : 302;
    console.log(
      `Redirecting customer (${redirectCode}) to Omniware:`,
      pgData.data.url,
    );
    return res.redirect(redirectCode, pgData.data.url);
  } catch (err: any) {
    console.error("handleOmniwareRedirect error:", err);
    return res.status(500).send(`<h3>Redirection error: ${err.message}</h3>`);
  }
}

/**
 * Handle Omniware Return URL Callback
 * Endpoint: POST /api/payment/omniware/callback or POST /api/public/payment/omniware/callback
 * Omniware sends customer browser back to this URL via POST upon completion
 */
export async function handleOmniwareCallback(req: Request, res: Response) {
  try {
    const responseData = req.body || {};
    console.log("Omniware return callback received:", responseData);

    const {
      order_id,
      transaction_id,
      response_code,
      response_message,
      error_desc,
      amount,
      payment_mode,
      payment_channel,
      email,
      udf1,
      udf2,
      udf3,
      hash,
    } = responseData;

    const activeAccount = await getActivePaymentAccount(undefined, "omniware");
    const cfg = activeAccount?.get("config") || {};
    const salt = cfg.salt || cfg.key_secret || DEFAULT_OMNIWARE_CONFIG.salt;

    // Verify Hash integrity
    const isValidHash = verifyOmniwareResponseHash(responseData, salt);
    if (!isValidHash && hash) {
      console.warn(
        "Omniware callback hash verification failed! Potential data tampering.",
      );
    }

    const isSuccess = String(response_code) === "0" && (isValidHash || !hash);
    const planName = udf1 || "Premium";
    const targetEmail = udf2 || email;

    // Record transaction in customer record
    if (targetEmail) {
      const customer = await Customers.findOne({
        email: { $regex: `^${String(targetEmail).trim()}$`, $options: "i" },
      });

      if (customer) {
        const now = new Date();
        const startDate = now.toISOString().split("T")[0];
        const endDt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const endDate = endDt.toISOString().split("T")[0];

        const summaryData: any = {
          invoice_no: `INV_${Date.now()}`,
          order_id: order_id || `ORD_${Date.now()}`,
          payment_id: transaction_id || `TXN_${Date.now()}`,
          payment_method: payment_channel
            ? `${payment_mode} (${payment_channel})`
            : payment_mode || "NetBanking",
          payment_status: isSuccess ? "Success" : "Failed",
          payment_type: "Full",
          amount: Number(amount) || 0,
          total_amount: Number(amount) || 0,
          transaction_date: startDate,
          account_name: activeAccount?.get("account_name") || "Omniware",
          provider: "omniware",
        };

        if (!isSuccess) {
          summaryData.error_code = response_code || "PAYMENT_FAILED";
          summaryData.error_description =
            response_message || error_desc || "Transaction failed or declined";
        }

        const newHistoryRecord = {
          current_plan: isSuccess,
          plan: planName,
          purchase_date: startDate,
          expired_date: endDate,
          summary: summaryData,
        };

        let currentHistory = Array.isArray(customer.get("transaction.history"))
          ? customer.get("transaction.history")
          : [];
        currentHistory.push(newHistoryRecord);

        let legacyTransactions = Array.isArray(customer.get("transaction"))
          ? customer.get("transaction")
          : [];
        legacyTransactions.push({
          payment_type: "Full",
          transaction_id: transaction_id || `TXN_${Date.now()}`,
          transaction_date: startDate,
          status: isSuccess ? "Success" : "Failed",
          amount: String(amount || "0"),
          currency_type: "₹",
          plan: planName,
          mode: payment_mode || "NetBanking",
          plan_start: startDate,
          plan_end: endDate,
          account_name: activeAccount?.get("account_name") || "Omniware",
          provider: "omniware",
          error_code: isSuccess ? undefined : response_code,
          error_description: isSuccess
            ? undefined
            : response_message || error_desc,
        });

        customer.set("transaction", legacyTransactions);
        customer.set("transaction.history", currentHistory);
        if (isSuccess) {
          customer.set("subscription_type", planName);
        }
        customer.set("modifiedAtTime", now);
        await customer.save();
      }
    }

    // Determine client frontend redirect URL
    const clientOrigin =
      udf3 || process.env.FRONTEND_URL || "https://soulconect.com";

    if (isSuccess) {
      const redirectUrl = `${clientOrigin}?payment=success&order_id=${encodeURIComponent(
        order_id || "",
      )}&txn=${encodeURIComponent(transaction_id || "")}&plan=${encodeURIComponent(
        planName,
      )}&amount=${encodeURIComponent(
        amount || "",
      )}&payment_mode=${encodeURIComponent(
        payment_mode || "",
      )}&payment_type=${encodeURIComponent(
        payment_mode || "",
      )}&payment_channel=${encodeURIComponent(payment_channel || "")}`;
      return res.redirect(302, redirectUrl);
    } else {
      const redirectUrl = `${clientOrigin}/?payment=failed&order_id=${encodeURIComponent(
        order_id || "",
      )}&reason=${encodeURIComponent(
        response_message || error_desc || "Transaction Failed",
      )}`;
      return res.redirect(302, redirectUrl);
    }
  } catch (err: any) {
    console.error("handleOmniwareCallback error:", err);
    return res
      .status(500)
      .send(`<h3>Error processing callback: ${err.message}</h3>`);
  }
}

/**
 * Handle Omniware Server-to-Server Webhook
 * Endpoint: POST /api/payment/omniware/webhook or POST /api/public/payment/omniware/webhook
 */
export async function handleOmniwareWebhook(req: Request, res: Response) {
  try {
    const data = req.body || {};
    const activeAccount = await getActivePaymentAccount(undefined, "omniware");
    const cfg = activeAccount?.get("config") || {};
    const salt = cfg.salt || cfg.key_secret || DEFAULT_OMNIWARE_CONFIG.salt;

    const isValid = verifyOmniwareResponseHash(data, salt);
    if (!isValid && data.hash) {
      return res
        .status(400)
        .json({ error: "Invalid Omniware webhook hash signature" });
    }

    console.log("Omniware server-to-server webhook verified:", data);
    return res
      .status(200)
      .json({ status: "SUCCESS", message: "Webhook received" });
  } catch (err: any) {
    console.error("handleOmniwareWebhook error:", err);
    return res.status(500).json({ error: err.message || "Webhook error" });
  }
}
