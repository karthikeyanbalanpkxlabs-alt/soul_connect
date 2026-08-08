"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, ShieldCheck, Key, Settings, CheckCircle2 } from "lucide-react";

interface PaymentAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  initialData?: any;
}

export default function PaymentAccountModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PaymentAccountModalProps) {
  const isEdit = !!initialData;

  const [accountName, setAccountName] = useState("");
  const [provider, setProvider] = useState("razorpay");
  const [environment, setEnvironment] = useState("test");
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [receiptPrefix, setReceiptPrefix] = useState("ORD");
  const [capturePayment, setCapturePayment] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setAccountName(initialData.account_name || "");
      setProvider(initialData.provider || "razorpay");
      setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);

      const cfg = initialData.config || {};
      setEnvironment(cfg.environment || "test");
      setKeyId(cfg.key_id || "");
      setKeySecret(cfg.key_secret || "");
      setWebhookSecret(cfg.webhook_secret || "");
      setWebhookUrl(cfg.webhook?.url || "");
      setCurrency(cfg.currency || "INR");
      setReceiptPrefix(cfg.order?.receipt_prefix || "ORD");
      setCapturePayment(cfg.capture_payment !== undefined ? cfg.capture_payment : true);
    } else {
      setAccountName("");
      setProvider("razorpay");
      setEnvironment("test");
      setKeyId("");
      setKeySecret("");
      setWebhookSecret("");
      setWebhookUrl("");
      setCurrency("INR");
      setReceiptPrefix("ORD");
      setCapturePayment(true);
      setIsActive(true);
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setError("Account Name is required");
      return;
    }
    if (!provider.trim()) {
      setError("Provider is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        id: initialData?._id || initialData?.id,
        account_name: accountName.trim(),
        provider: provider.trim(),
        is_active: isActive,
        config: {
          key_id: keyId.trim(),
          key_secret: keySecret.trim(),
          webhook_secret: webhookSecret.trim(),
          environment: environment,
          currency: currency.trim() || "INR",
          capture_payment: capturePayment,
          payment_method: initialData?.config?.payment_method || "all",
          webhook: {
            enabled: true,
            url: webhookUrl.trim() || `https://api.soulconnect.in/api/payment/${provider}/webhook`,
            events: initialData?.config?.webhook?.events || [
              "payment.authorized",
              "payment.captured",
              "payment.failed",
              "order.paid",
              "refund.created",
              "refund.processed",
              "refund.failed",
            ],
          },
          order: {
            receipt_prefix: receiptPrefix.trim() || "ORD",
            notes: initialData?.config?.order?.notes || {},
          },
          refund: {
            enabled: true,
          },
          retry: {
            enabled: true,
            max_attempts: 3,
          },
        },
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save payment account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <CreditCard size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEdit ? "Edit Payment Account" : "Create Payment Account"}
              </h2>
              <p className="text-xs text-gray-500">
                Configure payment gateway integration keys and environment settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
              <Settings size={14} /> Basic Account Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Account Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. razor, stripe_prod"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Gateway Provider <span className="text-rose-500">*</span>
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-white"
                >
                  <option value="razorpay">Razorpay</option>
                  <option value="stripe">Stripe</option>
                  <option value="paytm">Paytm</option>
                  <option value="phonepe">PhonePe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-white"
                >
                  <option value="test">Test / Sandbox</option>
                  <option value="live">Live / Production</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  placeholder="e.g. INR, USD"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Credentials Section */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
              <Key size={14} /> Credentials & Keys
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Key ID / Publishable Key
                </label>
                <input
                  type="text"
                  placeholder="rzp_test_xxxxxxxxxxxxx"
                  value={keyId}
                  onChange={(e) => setKeyId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Key Secret
                </label>
                <input
                  type="password"
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={keySecret}
                  onChange={(e) => setKeySecret(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Webhook Secret
                </label>
                <input
                  type="text"
                  placeholder="whsec_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://api.soulconnect.in/api/payment/razorpay/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Settings & Status */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Options & Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Order Receipt Prefix
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD"
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={capturePayment}
                    onChange={(e) => setCapturePayment(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-xs font-medium text-gray-700">Auto-capture payment</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Account Active Status
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>{isEdit ? "Update Account" : "Create Account"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
