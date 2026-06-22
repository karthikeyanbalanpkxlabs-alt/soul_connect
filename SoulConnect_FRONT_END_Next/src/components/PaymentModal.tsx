"use client";

import { useState } from "react";
import { X, CreditCard, Send, Sparkles } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  planName: string;
  price: string;
  features: string[];
  onClose: () => void;
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function PaymentModal({
  isOpen,
  planName,
  price,
  features,
  onClose,
  showToast,
}: PaymentModalProps) {
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txId, setTxId] = useState("");

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === "upi" && !upiId.includes("@")) {
      showToast("Please enter a valid UPI ID (e.g. name@upi)", "error");
      return;
    }
    if (method === "card" && (cardNumber.replace(/\s+/g, "").length < 16 || expiry.length < 5 || cvv.length < 3)) {
      showToast("Please fill in valid card details", "error");
      return;
    }

    setProcessing(true);

    // Simulate gateway delay
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      const generatedTxId = "TXN" + Math.floor(100000000 + Math.random() * 900000000);
      setTxId(generatedTxId);
      showToast(`${planName} Plan activated successfully!`, "success");
    }, 2000);
  };

  const handleClose = () => {
    // Reset states
    setSuccess(false);
    setUpiId("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setName("");
    onClose();
  };

  return (
    <div className={`modal-overlay open`} onClick={handleClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative" }}
      >
        <button className="modal-close" onClick={handleClose}>
          <X className="h-4 w-4" />
        </button>

        {!success ? (
          <>
            <h3 className="modal-title">Upgrade to {planName}</h3>
            <p className="modal-sub">Get instant access to premium candidates & verified profiles</p>

            <div className="amount-display">
              <span className="amount-label">Amount Payable:</span>
              <span className="amount-value">{price}</span>
            </div>

            <form onSubmit={handlePay}>
              <div className="payment-methods">
                <button
                  type="button"
                  className={`pm-btn ${method === "upi" ? "active" : ""}`}
                  onClick={() => setMethod("upi")}
                >
                  <span className="pm-btn-icon">⚡</span>
                  <span className="pm-btn-label">UPI Transfer</span>
                </button>
                <button
                  type="button"
                  className={`pm-btn ${method === "card" ? "active" : ""}`}
                  onClick={() => setMethod("card")}
                >
                  <span className="pm-btn-icon">💳</span>
                  <span className="pm-btn-label">Card Payment</span>
                </button>
              </div>

              {method === "upi" ? (
                <div className="form-group">
                  <label htmlFor="upiId">UPI ID (VPA)</label>
                  <input
                    type="text"
                    id="upiId"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobileNumber@ybl or name@okaxis"
                    required
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    Supports Google Pay, PhonePe, Paytm, BHIM and all major bank apps
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="form-group">
                    <label htmlFor="cardNum">Card Number</label>
                    <input
                      type="text"
                      id="cardNum"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(
                          e.target.value
                            .replace(/\s?/g, "")
                            .replace(/(\d{4})/g, "$1 ")
                            .trim()
                            .substring(0, 19)
                        )
                      }
                      placeholder="4111 2222 3333 4444"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label htmlFor="expiry">Expiry Date</label>
                      <input
                        type="text"
                        id="expiry"
                        value={expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 2) {
                            val = val.substring(0, 2) + "/" + val.substring(2, 4);
                          }
                          setExpiry(val.substring(0, 5));
                        }}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        type="password"
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                        placeholder="•••"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="holderName">Cardholder Name</label>
                    <input
                      type="text"
                      id="holderName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name printed on card"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="btn-pay w-full mt-4 flex items-center justify-center gap-2"
                style={{ minHeight: "48px" }}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Contacting Bank Gateway...
                  </span>
                ) : (
                  <>
                    <span>Proceed to Secure Pay</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <span className="text-3xl text-emerald-600">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h3>
            <p className="text-sm text-gray-500 mb-6">Your transaction was processed securely.</p>

            <div className="rounded-xl bg-gray-50 p-4 border border-dashed border-gray-200 text-left mb-6 text-xs text-gray-600 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">PLAN DETAILS</span>
                <span className="font-bold text-indigo-600">{planName.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>AMOUNT PAID</span>
                <span className="font-bold text-gray-800">{price}</span>
              </div>
              <div className="flex justify-between">
                <span>TRANSACTION ID</span>
                <span className="font-mono text-gray-800">{txId}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE & TIME</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="btn-pay w-full"
            >
              Start Searching Matches ✦
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
