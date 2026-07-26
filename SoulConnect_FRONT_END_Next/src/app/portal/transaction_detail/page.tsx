"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import keycloak from "../../../lib/keycloak";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Receipt,
  Clock,
  ShieldCheck,
} from "lucide-react";
import configUrls from "../../../../configUrls";

function TransactionDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchCustomer = async () => {
      try {
        const token = keycloak?.token;
        const res = await fetch(
          `${configUrls?.apiUrl}/api/transactions_detail/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch customer details");
        }

        const data = await res.json();
        setCustomer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-red-500">
          Error Loading Details
        </h2>
        <p className="mt-2 text-gray-600">{error || "Customer not found"}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 rounded-lg bg-violet-600 px-6 py-2 text-white hover:bg-violet-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const history = customer?.transaction?.history || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 mt-16 md:p-12">
      <button
        onClick={() => router.back()}
        className="cursor-pointer mb-8 flex items-center gap-2 text-slate-500 hover:text-violet-700 transition font-medium"
      >
        <ArrowLeft size={20} /> Back to Transactions
      </button>

      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Transaction History List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Receipt size={24} className="text-violet-600" />
              Transaction History ({history.length} Record
              {history.length !== 1 ? "s" : ""})
            </h2>

            {history.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-xl border border-slate-100">
                No transaction records found for this customer.
              </div>
            ) : (
              // Order by newest transaction first
              [...history]
                .sort(
                  (a: any, b: any) =>
                    new Date(
                      b.purchase_date || b.summary?.transaction_date || 0,
                    ).getTime() -
                    new Date(
                      a.purchase_date || a.summary?.transaction_date || 0,
                    ).getTime(),
                )
                .map((tx: any, idx: number) => {
                  const isSuccess =
                    String(tx?.summary?.payment_status || "").toLowerCase() ===
                    "success";

                  return (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100 flex flex-col transition hover:shadow-2xl"
                    >
                      {/* Invoice Card Header */}
                      <div
                        className={`p-6 text-white ${
                          !tx.current_plan
                            ? "bg-gradient-to-r from-slate-400 to-slate-500"
                            : isSuccess
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                              : "bg-gradient-to-r from-rose-500 to-pink-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Receipt size={24} />
                            <div>
                              <h3 className="font-bold text-lg">
                                Invoice: {tx.summary?.invoice_no || "N/A"}
                              </h3>
                              <p className="text-xs opacity-90">
                                Plan Option: {tx.plan || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                !tx.current_plan
                                  ? "bg-slate-100 text-slate-600"
                                  : isSuccess
                                    ? "bg-white text-emerald-600"
                                    : "bg-white text-rose-600"
                              }`}
                            >
                              {tx.summary?.payment_status || "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Invoice Body */}
                      <div
                        className={`p-6 ${!tx.current_plan ? "opacity-75" : ""}`}
                      >
                        {/* Transaction Identifiers */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 border-b border-dashed border-slate-200 pb-4 text-xs">
                          <div>
                            <span className="text-slate-400 block uppercase font-medium">
                              Order ID
                            </span>
                            <span className="font-semibold text-slate-800">
                              {tx.summary?.order_id || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase font-medium">
                              Payment ID
                            </span>
                            <span className="font-semibold text-slate-800">
                              {tx.summary?.payment_id || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase font-medium">
                              Payment Method
                            </span>
                            <span className="font-semibold text-slate-800">
                              {tx.summary?.payment_method || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Billing Description */}
                        <div className="my-6">
                          <div className="flex justify-between text-sm font-semibold text-slate-700">
                            <div>
                              <span>
                                SoulConect {tx.plan || "Standard"} Subscription
                              </span>
                              <span className="block text-xs font-normal text-slate-400 mt-1">
                                Validity:{" "}
                                {tx.purchase_date
                                  ? new Date(
                                      tx.purchase_date,
                                    ).toLocaleDateString()
                                  : "N/A"}{" "}
                                -{" "}
                                {tx.expired_date
                                  ? new Date(
                                      tx.expired_date,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="block text-slate-900 font-bold">
                                ₹
                                {tx.summary?.total_amount ||
                                  tx.summary?.amount ||
                                  0}
                              </span>
                              {tx.summary?.discount > 0 && (
                                <span className="block text-xs text-emerald-600 font-normal">
                                  Discount: -₹{tx.summary.discount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Summary Total Breakdown */}
                        <div className="flex flex-col items-end gap-1.5 border-t border-slate-100 pt-4 text-xs">
                          <div className="flex justify-between w-48 text-slate-500">
                            <span>Subtotal</span>
                            <span>₹{tx.summary?.amount || 0}</span>
                          </div>
                          <div className="flex justify-between w-48 text-slate-500">
                            <span>Tax</span>
                            <span>₹{tx.summary?.tax || 0}</span>
                          </div>
                          <div className="flex justify-between w-48 text-slate-500">
                            <span>Discount</span>
                            <span className="text-emerald-600">
                              -₹{tx.summary?.discount || 0}
                            </span>
                          </div>
                          <div className="flex justify-between w-48 font-bold text-slate-800 border-t border-slate-100 pt-2 mt-1">
                            <span>Total Amount Paid</span>
                            <span
                              className={`text-sm ${
                                !tx.current_plan
                                  ? "text-slate-500"
                                  : "text-violet-600"
                              }`}
                            >
                              ₹{tx.summary?.total_amount || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="bg-slate-50 p-4 px-6 border-t border-slate-100 rounded-b-3xl flex justify-between items-center text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>
                            Purchase Date:{" "}
                            {tx.summary?.transaction_date || tx.purchase_date
                              ? new Date(
                                  tx.summary?.transaction_date ||
                                    tx.purchase_date,
                                ).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          <span className="font-medium">
                            Plan Status:{" "}
                            {tx.current_plan ? (
                              <span className="text-emerald-600 font-bold">
                                Active (Current)
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Expired / Inactive
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Customer Context Side Card */}
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100">
              {/* Mini Banner Header */}
              <div className="h-24 w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 relative"></div>

              {/* Avatar overlapping banner */}
              <div className="flex flex-col items-center -mt-10 px-6 pb-5 border-b border-slate-100">
                <div className="relative h-20 w-20 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-md">
                  {customer.image && customer.image.length > 0 ? (
                    <img
                      src={customer.image[0].url}
                      alt={`${customer.first_name} ${customer.last_name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-violet-100 text-violet-600">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mt-3 capitalize">
                  {customer.first_name} {customer.last_name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {customer.email}
                </p>
                <span className="inline-block mt-2.5 rounded bg-violet-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-violet-700">
                  {customer.subscription_type || "N/A"}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    Phone Number
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-slate-800 font-semibold">
                    <Phone size={14} className="text-slate-400" />
                    <span>
                      {customer.phone_code} {customer.phone_number}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    View Access Count
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {customer.subscription_view_access || 0} views
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-600">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Security & KYC
                  </h3>
                  <p className="text-xs text-slate-400">Verification status</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    KYC Verification
                  </span>
                  <span
                    className={`inline-block mt-1 rounded px-2.5 py-0.5 text-xs font-bold uppercase ${
                      customer.public_verify
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {customer.public_verify
                      ? "Verified"
                      : "Pending Verification"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    Role Assignment
                  </span>
                  <span className="text-xs font-semibold text-slate-600 capitalize">
                    {String(customer.role || "N/A").replace("_g", "")}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    Registered Location
                  </span>
                  <span className="text-xs font-semibold text-slate-600 capitalize">
                    {customer.district ? `${customer.district}, ` : ""}
                    {customer.state || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
        </div>
      }
    >
      <TransactionDetailContent />
    </Suspense>
  );
}
