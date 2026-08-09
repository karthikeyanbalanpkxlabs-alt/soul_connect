import { Request, Response } from "express";
import { PaymentAccount } from "../models/paymentAccount";

/**
 * LIST payment accounts with pagination, filter, and sorting
 */
export async function handlePaymentAccountList(req: Request, res: Response) {
  try {
    const limit = parseInt(req.body.limit) || 100;
    const skip = parseInt(req.body.skip) || 0;
    const reqFilters = req.body.filters || {};
    const filter: any = {};

    for (const key of Object.keys(reqFilters)) {
      const val = reqFilters[key];
      if (val !== undefined && val !== null && val !== "") {
        if (key === "is_active") {
          const lowerVal = String(val).toLowerCase();
          if (lowerVal === "true" || lowerVal === "active") {
            filter.is_active = true;
          } else if (lowerVal === "false" || lowerVal === "inactive") {
            filter.is_active = false;
          }
        } else {
          filter[key] = { $regex: String(val), $options: "i" };
        }
      }
    }

    let sortOption: any = { updated_at: -1, _id: -1 };
    if (req.body.sort) {
      const direction = req.body.order === "asc" ? 1 : -1;
      sortOption = { [req.body.sort]: direction };
    }

    const total = await PaymentAccount.countDocuments(filter);
    const list = await PaymentAccount.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      limit,
      skip,
      data: list,
    });
  } catch (err: any) {
    console.error("payment_account_list error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch payment account list" });
  }
}

/**
 * CREATE a new payment account
 */
export async function handlePaymentAccountCreate(req: Request, res: Response) {
  try {
    const { account_name, provider, config, is_active } = req.body;

    if (!account_name || !provider) {
      return res.status(400).json({
        error: "Missing required fields (account_name, provider)",
      });
    }

    const existingAccount = await PaymentAccount.findOne({
      account_name: account_name.trim(),
    });
    if (existingAccount) {
      return res.status(400).json({
        error: `Payment account with name '${account_name}' already exists.`,
      });
    }

    const shouldBeActive = is_active !== undefined ? !!is_active : true;

    // SINGLE ACTIVE ACCOUNT RULE: Deactivate all other accounts if this account is active
    if (shouldBeActive) {
      await PaymentAccount.updateMany({}, { $set: { is_active: false } });
    }

    const now = new Date();
    const newAccount = new PaymentAccount({
      account_name: account_name.trim(),
      provider: provider.trim(),
      config: config || {},
      is_active: shouldBeActive,
      created_at: now,
      updated_at: now,
    });

    await newAccount.save();

    res.status(201).json({
      success: true,
      message: "Payment account created successfully",
      data: newAccount,
    });
  } catch (err: any) {
    console.error("payment_account_create error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to create payment account" });
  }
}

/**
 * EDIT an existing payment account
 */
export async function handlePaymentAccountEdit(req: Request, res: Response) {
  try {
    const { id, _id, account_name, provider, config, is_active } = req.body;
    const targetId = id || _id;

    if (!targetId) {
      return res.status(400).json({
        error: "Missing payment account identifier (id or _id) in request body",
      });
    }

    const currentAccount = await PaymentAccount.findById(targetId);
    if (!currentAccount) {
      return res.status(404).json({ error: "Payment account not found" });
    }

    if (account_name && account_name.trim() !== currentAccount.account_name) {
      const existingName = await PaymentAccount.findOne({
        account_name: account_name.trim(),
        _id: { $ne: targetId },
      });
      if (existingName) {
        return res.status(400).json({
          error: `Payment account with name '${account_name}' already exists.`,
        });
      }
    }

    const updateFields: any = {
      updated_at: new Date(),
    };

    if (account_name !== undefined) updateFields.account_name = account_name.trim();
    if (provider !== undefined) updateFields.provider = provider.trim();
    if (config !== undefined) updateFields.config = config;
    if (is_active !== undefined) updateFields.is_active = !!is_active;

    // SINGLE ACTIVE ACCOUNT RULE: Deactivate all other accounts if this account is active
    if (is_active === true) {
      await PaymentAccount.updateMany(
        { _id: { $ne: targetId } },
        { $set: { is_active: false } },
      );
    }

    const updatedAccount = await PaymentAccount.findByIdAndUpdate(
      targetId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Payment account updated successfully",
      data: updatedAccount,
    });
  } catch (err: any) {
    console.error("payment_account_edit error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to update payment account" });
  }
}

/**
 * DETAIL view (POST body search)
 */
export async function handlePaymentAccountDetail(req: Request, res: Response) {
  try {
    const { id, _id, account_name } = req.body;
    const targetId = id || _id;
    let query: any = {};

    if (targetId) query._id = targetId;
    else if (account_name) query.account_name = account_name;
    else {
      return res.status(400).json({
        error: "Missing identifier (id, _id, or account_name) in request body",
      });
    }

    const account = await PaymentAccount.findOne(query);
    if (!account) {
      return res.status(404).json({ error: "Payment account not found" });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (err: any) {
    console.error("payment_account_detail error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch payment account detail" });
  }
}

/**
 * DETAIL view (GET URL param search)
 */
export async function handlePaymentAccountDetailGet(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res
        .status(400)
        .json({ error: "Missing identifier in request URL" });
    }

    let account;
    if (typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)) {
      account = await PaymentAccount.findById(id);
    } else {
      account = await PaymentAccount.findOne({ account_name: id });
    }

    if (!account) {
      return res.status(404).json({ error: "Payment account not found" });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (err: any) {
    console.error("payment_account_detail_get error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch payment account detail" });
  }
}
