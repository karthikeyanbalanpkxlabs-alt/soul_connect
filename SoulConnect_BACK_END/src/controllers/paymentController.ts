import { Request, Response } from "express";
import crypto from "crypto";
import { Customers } from "../models/customer";
import { PaymentAccount } from "../models/paymentAccount";
import {
  GatewayConfig,
  generateGatewayHash,
  verifyGatewayHash,
  encryptGatewayData,
  decryptGatewayData,
  fetchUpiIntentUrl,
  fetchPaymentRequestUrl,
  expirePaymentUrl,
  generateChallanUrl,
  executeSeamlessPayment,
  checkPaymentStatus,
  initiateRefund,
  checkRefundStatus,
} from "../services/paymentGatewayService";

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
 * Helper to fetch active payment_account config for the Payment Gateway
 */
export async function getGatewayConfig(
  accountName?: string,
  provider?: string,
): Promise<{ config: GatewayConfig; account: any }> {
  // If provider not specified or is "gateway", search for active account
  let account = await getActivePaymentAccount(accountName, provider);
  if (!account && !accountName && !provider) {
    // Fallback: search for any active account whose provider isn't razorpay
    account = await PaymentAccount.findOne({
      is_active: true,
      provider: { $ne: "razorpay" },
    });
  }

  const cfg = account?.get("config") || {};

  const gatewayConfig: GatewayConfig = {
    api_key:
      cfg.api_key ||
      cfg.merchant_key ||
      cfg.key_id ||
      process.env.PG_API_KEY ||
      "",
    salt: cfg.salt || cfg.key_secret || process.env.PG_SALT || "",
    pg_api_url:
      cfg.pg_api_url ||
      cfg.gateway_url ||
      process.env.PG_API_URL ||
      "https://api.paymentgateway.com",
    encryption_key:
      cfg.encryption_key || process.env.PG_ENCRYPTION_KEY || "",
    decryption_key:
      cfg.decryption_key || process.env.PG_DECRYPTION_KEY || "",
  };

  return { config: gatewayConfig, account };
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

// --------------------------------------------------------------------------------------
// PAYMENT GATEWAY SPECIFIC CONTROLLERS (UPI, CHARGE PAGE, STATUS, REFUND)
// --------------------------------------------------------------------------------------

/**
 * 1. CREATE UPI INTENT (Section 5)
 * Endpoint: POST /api/payment/gateway/upi-intent or via /makePayment { action: "create_upi_intent" }
 */
export async function handleCreateUpiIntent(req: Request, res: Response) {
  try {
    const {
      amount,
      order_id,
      currency,
      description,
      name,
      email,
      phone,
      city,
      state,
      country,
      zip_code,
      return_url,
      return_url_failure,
      return_url_cancel,
      mode,
      account_name,
      provider,
    } = req.body;

    if (!amount || isNaN(Number(amount))) {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'amount' in request body" });
    }

    const { config, account } = await getGatewayConfig(account_name, provider);
    if (!config.api_key || !config.salt) {
      return res.status(400).json({
        success: false,
        error:
          "Payment gateway is not configured with valid api_key and salt in PaymentAccount or environment variables.",
        error_code: "GATEWAY_CONFIG_MISSING",
      });
    }

    // Lookup customer info if email is provided and some contact fields are missing
    let custName = name || "Customer";
    let custPhone = phone || "9999999999";
    let custCity = city || "Bangalore";
    let custZip = zip_code || "560001";
    let custCountry = country || "IND";

    if (email) {
      const customer = await Customers.findOne({
        email: { $regex: `^${String(email).trim()}$`, $options: "i" },
      });
      if (customer) {
        custName =
          name ||
          `${customer.get("first_name") || customer.get("firstName") || ""} ${customer.get("last_name") || customer.get("lastName") || ""}`.trim() ||
          custName;
        custPhone = phone || customer.get("phone") || custPhone;
        custCity = city || customer.get("city") || custCity;
        custZip = zip_code || customer.get("zip_code") || custZip;
      }
    }

    const generatedOrderId =
      order_id || `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const returnUrl =
      return_url ||
      `${req.protocol}://${req.get("host")}/api/public/payment/gateway/callback`;

    const gatewayPayload = {
      order_id: generatedOrderId,
      amount: Number(amount).toFixed(2),
      currency: currency || "INR",
      description: description || `Payment for order ${generatedOrderId}`,
      name: custName,
      email: email || "customer@example.com",
      phone: custPhone,
      city: custCity,
      state: state || "",
      country: custCountry,
      zip_code: custZip,
      return_url: returnUrl,
      return_url_failure: return_url_failure || returnUrl,
      return_url_cancel: return_url_cancel || returnUrl,
      mode: (mode as "TEST" | "LIVE") || "LIVE",
    };

    const response = await fetchUpiIntentUrl(gatewayPayload, config);

    if (response.error) {
      return res.status(400).json({
        success: false,
        error: response.error.message || "Failed to generate UPI Intent URL",
        gateway_error: response.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "UPI Intent URL generated successfully",
      data: {
        ...response.data,
        order_id: generatedOrderId,
        amount: Number(amount),
        currency: currency || "INR",
        account_name: account?.get("account_name"),
      },
    });
  } catch (err: any) {
    console.error("handleCreateUpiIntent error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to generate UPI Intent URL" });
  }
}

/**
 * 2. CREATE HOSTED CHARGE PAGE URL (Section 4)
 * Endpoint: POST /api/payment/gateway/charge-page or via /makePayment { action: "create_charge_page" }
 */
export async function handleCreateChargePage(req: Request, res: Response) {
  try {
    const {
      amount,
      order_id,
      currency,
      description,
      name,
      email,
      phone,
      city,
      state,
      country,
      zip_code,
      return_url,
      return_url_failure,
      return_url_cancel,
      expiry_in_minutes,
      payment_options,
      allowed_bank_codes,
      mode,
      account_name,
      provider,
    } = req.body;

    if (!amount || isNaN(Number(amount))) {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'amount' in request body" });
    }

    const { config, account } = await getGatewayConfig(account_name, provider);
    if (!config.api_key || !config.salt) {
      return res.status(400).json({
        success: false,
        error:
          "Payment gateway is not configured with valid api_key and salt in PaymentAccount or environment variables.",
        error_code: "GATEWAY_CONFIG_MISSING",
      });
    }

    let custName = name || "Customer";
    let custPhone = phone || "9999999999";
    let custCity = city || "Bangalore";
    let custZip = zip_code || "560001";
    let custCountry = country || "IND";

    if (email) {
      const customer = await Customers.findOne({
        email: { $regex: `^${String(email).trim()}$`, $options: "i" },
      });
      if (customer) {
        custName =
          name ||
          `${customer.get("first_name") || customer.get("firstName") || ""} ${customer.get("last_name") || customer.get("lastName") || ""}`.trim() ||
          custName;
        custPhone = phone || customer.get("phone") || custPhone;
        custCity = city || customer.get("city") || custCity;
        custZip = zip_code || customer.get("zip_code") || custZip;
      }
    }

    const generatedOrderId =
      order_id || `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const returnUrl =
      return_url ||
      `${req.protocol}://${req.get("host")}/api/public/payment/gateway/callback`;

    const gatewayPayload = {
      order_id: generatedOrderId,
      amount: Number(amount).toFixed(2),
      currency: currency || "INR",
      description: description || `Payment for order ${generatedOrderId}`,
      name: custName,
      email: email || "customer@example.com",
      phone: custPhone,
      city: custCity,
      state: state || "",
      country: custCountry,
      zip_code: custZip,
      return_url: returnUrl,
      return_url_failure: return_url_failure || returnUrl,
      return_url_cancel: return_url_cancel || returnUrl,
      expiry_in_minutes: expiry_in_minutes || 15,
      payment_options: payment_options || "upi,cc,nb,w",
      allowed_bank_codes: allowed_bank_codes || "",
      mode: (mode as "TEST" | "LIVE") || "LIVE",
    };

    const response = await fetchPaymentRequestUrl(gatewayPayload, config);

    if (response.error) {
      return res.status(400).json({
        success: false,
        error: response.error.message || "Failed to generate charge page URL",
        gateway_error: response.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Charge page URL generated successfully",
      data: {
        ...response.data,
        order_id: generatedOrderId,
        amount: Number(amount),
        currency: currency || "INR",
        account_name: account?.get("account_name"),
      },
    });
  } catch (err: any) {
    console.error("handleCreateChargePage error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to generate charge page URL" });
  }
}

/**
 * 3. EXPIRE HOSTED CHARGE PAGE URL (Section 4.4)
 * Endpoint: POST /api/payment/gateway/expire-page
 */
export async function handleExpireChargePage(req: Request, res: Response) {
  try {
    const { uuid, account_name, provider } = req.body;
    if (!uuid) {
      return res.status(400).json({ error: "Missing required field 'uuid'" });
    }

    const { config } = await getGatewayConfig(account_name, provider);
    const response = await expirePaymentUrl(uuid, config);

    if (response.error) {
      return res.status(400).json({
        success: false,
        error: response.error.message || "Failed to expire charge page URL",
        gateway_error: response.error,
      });
    }

    res.status(200).json({
      success: true,
      data: response.data || response,
    });
  } catch (err: any) {
    console.error("handleExpireChargePage error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to expire charge page URL" });
  }
}

/**
 * 4. GENERATE CHALLAN / INVOICE LINK (Section 11.2)
 * Endpoint: POST /api/payment/gateway/challan
 */
export async function handleGenerateChallan(req: Request, res: Response) {
  try {
    const { name, mobile, email, amount, purpose, account_name, provider } =
      req.body;

    if (!name || !mobile || !email || !amount || !purpose) {
      return res.status(400).json({
        error: "Missing required fields (name, mobile, email, amount, purpose)",
      });
    }

    const { config } = await getGatewayConfig(account_name, provider);
    const response = await generateChallanUrl(
      {
        name,
        mobile,
        email,
        amount,
        purpose,
      },
      config,
    );

    if (response.error) {
      return res.status(400).json({
        success: false,
        error: response.error.message || "Failed to generate challan URL",
        gateway_error: response.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Challan / Invoice URL generated successfully",
      data: response.data || response,
    });
  } catch (err: any) {
    console.error("handleGenerateChallan error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to generate challan URL" });
  }
}

/**
 * 5. SEAMLESS UPI COLLECT PAYMENT (Section 13)
 * Endpoint: POST /api/payment/gateway/seamless-pay
 */
export async function handleSeamlessUpiPayment(req: Request, res: Response) {
  try {
    const {
      amount,
      order_id,
      currency,
      description,
      name,
      email,
      phone,
      city,
      state,
      country,
      zip_code,
      payer_virtual_address,
      bank_code,
      return_url,
      account_name,
      provider,
    } = req.body;

    if (!amount || isNaN(Number(amount))) {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'amount' in request body" });
    }

    const { config } = await getGatewayConfig(account_name, provider);
    const returnUrl =
      return_url ||
      `${req.protocol}://${req.get("host")}/api/public/payment/gateway/callback`;

    const generatedOrderId =
      order_id || `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const response = await executeSeamlessPayment(
      {
        order_id: generatedOrderId,
        amount,
        currency: currency || "INR",
        description: description || `Payment for order ${generatedOrderId}`,
        name: name || "Customer",
        email: email || "customer@example.com",
        phone: phone || "9999999999",
        city: city || "Bangalore",
        state: state || "",
        country: country || "IND",
        zip_code: zip_code || "560001",
        bank_code: bank_code || "UPIU",
        payer_virtual_address: payer_virtual_address || "",
        return_url: returnUrl,
      },
      config,
    );

    if (response.error) {
      return res.status(400).json({
        success: false,
        error: response.error.message || "Seamless payment request failed",
        gateway_error: response.error,
      });
    }

    res.status(200).json({
      success: true,
      data: response.data || response,
    });
  } catch (err: any) {
    console.error("handleSeamlessUpiPayment error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to execute seamless UPI payment" });
  }
}

/**
 * 6. TRANSACTION STATUS INQUIRY (Section 6)
 * Endpoint: POST /api/payment/gateway/status
 */
export async function handlePaymentStatusInquiry(req: Request, res: Response) {
  try {
    const {
      order_id,
      transaction_id,
      bank_code,
      response_code,
      customer_phone,
      customer_email,
      customer_name,
      date_from,
      date_to,
      page_number,
      per_page,
      account_name,
      provider,
    } = { ...req.query, ...req.body };

    const { config } = await getGatewayConfig(account_name, provider);

    const response = await checkPaymentStatus(
      {
        order_id,
        transaction_id,
        bank_code,
        response_code,
        customer_phone,
        customer_email,
        customer_name,
        date_from,
        date_to,
        page_number,
        per_page,
      },
      config,
    );

    if (response.error) {
      return res.status(400).json({
        success: false,
        error: response.error.message || "Failed to fetch payment status",
        gateway_error: response.error,
      });
    }

    // Verify response hash if present
    const isHashValid = verifyGatewayHash(response, config.salt);

    res.status(200).json({
      success: true,
      is_signature_valid: isHashValid,
      data: response.data || [],
      page: response.page,
    });
  } catch (err: any) {
    console.error("handlePaymentStatusInquiry error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to check payment status" });
  }
}

/**
 * 7. REFUND REQUEST (Section 7.1)
 * Endpoint: POST /api/payment/gateway/refund
 */
export async function handleRefundRequest(req: Request, res: Response) {
  try {
    const {
      transaction_id,
      amount,
      description,
      merchant_refund_id,
      merchant_order_id,
      email,
      account_name,
      provider,
    } = req.body;

    if (!transaction_id || !amount || !description) {
      return res.status(400).json({
        error: "Missing required fields (transaction_id, amount, description)",
      });
    }

    const { config, account } = await getGatewayConfig(account_name, provider);
    const response = await initiateRefund(
      {
        transaction_id,
        amount,
        description,
        merchant_refund_id,
        merchant_order_id,
      },
      config,
    );

    if (response.error) {
      return res.status(400).json({
        success: false,
        error: response.error.message || "Refund request failed",
        gateway_error: response.error,
      });
    }

    // Record refund record into customer transaction history if customer is found
    if (email || merchant_order_id || transaction_id) {
      try {
        let query: any = {};
        if (email) query.email = { $regex: `^${email.trim()}$`, $options: "i" };
        else if (merchant_order_id) query["transaction.summary.order_id"] = merchant_order_id;
        else if (transaction_id) query["transaction.summary.payment_id"] = transaction_id;

        const customer = await Customers.findOne(query);
        if (customer) {
          const now = new Date();
          const legacyTransactions = Array.isArray(customer.get("transaction"))
            ? customer.get("transaction")
            : [];

          legacyTransactions.push({
            payment_type: "refund",
            transaction_id: `REF_${transaction_id}`,
            transaction_date: now.toISOString(),
            status: "refunded",
            amount: `-${Number(amount).toFixed(2)}`,
            currency_type: "₹",
            plan: "Refund",
            mode: "Online Gateway",
            description,
            account_name: account?.get("account_name"),
            provider: account?.get("provider") || "gateway",
          });

          customer.set("transaction", legacyTransactions);
          customer.set("modifiedAtTime", now);
          await customer.save();
        }
      } catch (saveErr) {
        console.warn("Could not append refund to customer history:", saveErr);
      }
    }

    res.status(200).json({
      success: true,
      message: "Refund request accepted by gateway",
      data: response.data || response,
    });
  } catch (err: any) {
    console.error("handleRefundRequest error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to process refund request" });
  }
}

/**
 * 8. REFUND STATUS (Section 7.2)
 * Endpoint: POST /api/payment/gateway/refund-status
 */
export async function handleRefundStatus(req: Request, res: Response) {
  try {
    const { transaction_id, merchant_order_id, account_name, provider } = {
      ...req.query,
      ...req.body,
    };

    if (!transaction_id) {
      return res
        .status(400)
        .json({ error: "Missing required field 'transaction_id'" });
    }

    const { config } = await getGatewayConfig(account_name, provider);
    const response = await checkRefundStatus(
      {
        transaction_id,
        merchant_order_id,
      },
      config,
    );

    if (response.error) {
      return res.status(400).json({
        success: false,
        error: response.error.message || "Failed to fetch refund status",
        gateway_error: response.error,
      });
    }

    const isHashValid = verifyGatewayHash(response, config.salt);

    res.status(200).json({
      success: true,
      is_signature_valid: isHashValid,
      data: response.data || response,
    });
  } catch (err: any) {
    console.error("handleRefundStatus error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to check refund status" });
  }
}

/**
 * 9. SERVER-TO-SERVER CALLBACK & RETURN URL WEBHOOK (Section 12.1)
 * Endpoint: POST /api/payment/gateway/callback or /api/public/payment/gateway/callback
 */
export async function handleGatewayCallback(req: Request, res: Response) {
  try {
    const payload = { ...req.query, ...req.body };
    const { config, account } = await getGatewayConfig(
      payload.account_name,
      payload.provider,
    );

    // Verify hash integrity (Section 15.2)
    if (payload.hash && !verifyGatewayHash(payload, config.salt)) {
      console.error("Gateway Callback: Hash verification mismatch!", payload);
      return res.status(400).json({
        success: false,
        error: "Gateway callback hash mismatch / tampered data",
      });
    }

    const responseCode = Number(payload.response_code);
    const isSuccess = responseCode === 0;

    const targetEmail = payload.email || payload.customer_email || "";
    const orderId = payload.order_id || "";
    const txnId = payload.transaction_id || "";
    const amount = Number(payload.amount || payload.amount_orig || 0);

    if (targetEmail || orderId) {
      const fakeReq: any = {
        body: {
          email: targetEmail,
          order_id: orderId,
          payment_id: txnId,
          transaction_id: txnId,
          amount,
          payment_status: isSuccess ? "success" : "failed",
          status: isSuccess ? "success" : "failed",
          payment_method:
            payload.payment_mode || payload.payment_channel || "UPI",
          mode: payload.payment_mode || "UPI",
          plan: payload.udf1 || "Standard",
          error_code: payload.response_code,
          error_description: payload.error_desc || payload.response_message,
          account_name: account?.get("account_name"),
          provider: account?.get("provider") || "gateway",
        },
      };

      const fakeRes: any = {
        status: () => fakeRes,
        json: () => {},
      };

      await handleMakePayment(fakeReq, fakeRes);
    }

    // Check if customer browser was redirected (Content-Type html requested)
    const acceptsHtml = req.headers.accept?.includes("text/html");
    if (acceptsHtml) {
      return res.send(`
        <html>
          <body style="font-family:sans-serif; text-align:center; padding: 50px;">
            <h2>${isSuccess ? "Payment Successful!" : "Payment Failed"}</h2>
            <p>Order ID: ${orderId}</p>
            <p>Transaction ID: ${txnId}</p>
            <p>Status: ${payload.response_message || (isSuccess ? "Completed" : "Failed")}</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
      `);
    }

    return res.status(200).json({
      status: "ok",
      received: true,
      transaction_id: txnId,
      order_id: orderId,
      payment_status: isSuccess ? "success" : "failed",
    });
  } catch (err: any) {
    console.error("handleGatewayCallback error:", err);
    res.status(500).json({ error: err.message || "Callback processing failed" });
  }
}

// --------------------------------------------------------------------------------------
// COMBINED /makePayment CONTROLLER
// --------------------------------------------------------------------------------------

/**
 * Handle payment creation, signatures, active account validation, and transaction recording
 * Endpoint: POST /api/makePayment
 */
export async function handleMakePayment(req: Request, res: Response) {
  try {
    const { action, create_order } = req.body;

    // Route actions through unified endpoint
    if (
      action === "create_order" ||
      action === "createOrder" ||
      create_order === true
    ) {
      return await handleCreateRazorpayOrder(req, res);
    }

    if (action === "create_upi_intent" || action === "upi_intent") {
      return await handleCreateUpiIntent(req, res);
    }

    if (action === "create_charge_page" || action === "charge_page") {
      return await handleCreateChargePage(req, res);
    }

    if (action === "expire_charge_page" || action === "expire_url") {
      return await handleExpireChargePage(req, res);
    }

    if (action === "create_challan" || action === "challan") {
      return await handleGenerateChallan(req, res);
    }

    if (action === "seamless_upi" || action === "seamless_pay") {
      return await handleSeamlessUpiPayment(req, res);
    }

    if (action === "payment_status" || action === "check_status") {
      return await handlePaymentStatusInquiry(req, res);
    }

    if (action === "refund" || action === "refund_request") {
      return await handleRefundRequest(req, res);
    }

    if (action === "refund_status") {
      return await handleRefundStatus(req, res);
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
      payment_method ||
      mode ||
      (razorpay_payment_id ? "Razorpay" : "Online Gateway");
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
