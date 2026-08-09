import React from "react";
import { X, CreditCard, Key, Calendar } from "lucide-react";

interface PaymentAccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
}

export default function PaymentAccountDetailModal({
  isOpen,
  onClose,
  account,
}: PaymentAccountDetailModalProps) {
  if (!isOpen || !account) return null;

  const config = account.config || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 font-bold uppercase">
              <CreditCard size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {account.account_name}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                    account.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {account.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Payment Provider: <span className="font-medium text-gray-800 capitalize">{account.provider || "N/A"}</span>
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

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Key Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">
                Provider
              </span>
              <span className="text-sm font-semibold text-gray-900 capitalize mt-0.5 block">
                {account.provider || "N/A"}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">
                Environment
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase mt-1 ${
                  config.environment === "live"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {config.environment || "test"}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">
                Currency
              </span>
              <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                {config.currency || "INR"}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">
                Auto Capture
              </span>
              <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                {config.capture_payment ? "Enabled (true)" : "Disabled (false)"}
              </span>
            </div>
          </div>

          {/* Integration Keys Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
              <Key size={14} /> Gateway Integration Keys
            </h3>

            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Key ID / Publishable Key
                </span>
                <span className="font-mono text-gray-800 select-all font-medium text-sm">
                  {config.key_id || "N/A"}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Key Secret (Masked)
                </span>
                <span className="font-mono text-gray-800 font-medium">
                  {config.key_secret
                    ? `${config.key_secret.slice(0, 4)}****************${config.key_secret.slice(-4)}`
                    : "N/A"}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Webhook Secret
                </span>
                <span className="font-mono text-gray-800 font-medium">
                  {config.webhook_secret || "N/A"}
                </span>
              </div>

              {config.webhook?.url && (
                <div className="border-t border-gray-100 pt-3">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Webhook Endpoint URL
                  </span>
                  <span className="font-mono text-violet-700 font-medium break-all">
                    {config.webhook.url}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Calendar size={13} />
            <span>
              Created:{" "}
              {account.created_at
                ? new Date(account.created_at).toLocaleString()
                : "N/A"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition cursor-pointer"
          >
            Close Detail View
          </button>
        </div>
      </div>
    </div>
  );
}
