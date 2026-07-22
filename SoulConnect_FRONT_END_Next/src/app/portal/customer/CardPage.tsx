"use client";

import React, { useState } from "react";
import CustomerModal from "../../../components/CustomerModal";
import usePortalPage from "./usePortalCustomerPage";
import FilterSidebar from "./FilterSidebar";
import ProfileCard from "./ProfileCard";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  AlertTriangle,
  RefreshCw,
  Lock,
  ArrowRight,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/providers/KeycloakProvider";
function CardPage() {
  const { profile } = useKeycloak();
  const stateProps = usePortalPage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Latest");
  const tabs = ["Latest", "Popular", "Trending", "Best"];

  const handleView = (id: string) => {
    router.push(`/portal/customer_detail?id=${id}`);
  };

  console.log("profile", profile);

  const renderPublicVerify = () => {
    const idProofUrl =
      typeof profile?.identity_proff === "object"
        ? profile.identity_proff?.url
        : typeof profile?.identity_proff === "string"
          ? profile.identity_proff
          : null;
    const hasIdProof = !!idProofUrl;

    return (
      <div className="py-12 px-4 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Header Banner */}
          <div className="relative p-8 md:p-10 text-center bg-gradient-to-br from-rose-50 via-purple-50/50 to-white border-b border-gray-100">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-rose-200/20 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 rounded-full bg-purple-200/20 blur-2xl pointer-events-none"></div>

            <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-amber-50 rounded-full text-amber-500 ring-4 ring-amber-100/50 animate-pulse">
              <Clock className="w-10 h-10" />
            </div>

            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 font-semibold mb-3">
              Profile Verification Pending
            </h2>
            <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed font-body">
              Welcome to SoulConnect! To ensure a safe, secure, and authentic
              matchmaking environment, we manually review and verify every
              profile before activation.
            </p>
          </div>

          {/* Verification Timeline/Steps */}
          <div className="p-8 md:p-10 space-y-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 font-display">
              Verification Checkpoints
            </h3>

            <div className="relative border-l-2 border-dashed border-gray-100 pl-8 ml-4 space-y-8">
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -left-[41px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-sm">
                  <Check className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm font-body">
                    Profile Registered
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-body font-light">
                    Your matrimonial profile has been successfully created.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span
                  className={`absolute -left-[41px] top-0 flex items-center justify-center w-7 h-7 rounded-full shadow-sm ${
                    hasIdProof
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white animate-pulse"
                  }`}
                >
                  {hasIdProof ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-gray-900 text-sm font-body">
                      Identity Proof Upload
                    </h4>
                    {!hasIdProof && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 font-body font-light">
                    {hasIdProof
                      ? "Document successfully uploaded and received."
                      : "Please upload a valid Govt ID (Aadhaar, Passport, etc.) to proceed with verification."}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span
                  className={`absolute -left-[41px] top-0 flex items-center justify-center w-7 h-7 rounded-full shadow-sm ${
                    hasIdProof
                      ? "bg-amber-100 text-amber-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {hasIdProof ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm font-body">
                    Manual Verification Check
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-body font-light">
                    {hasIdProof
                      ? "Our admin panel is verifying your documents and details."
                      : "Awaiting ID proof submission before review can begin."}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <span className="absolute -left-[41px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-400 shadow-sm">
                  <Lock className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm font-body">
                    Profile Activation
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-body font-light">
                    You will receive full access to search and view matches once
                    approved.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="bg-gray-50/50 p-8 md:p-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h4 className="font-semibold text-gray-900 text-sm font-body font-semibold">
                Need help or want to check status?
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 font-body font-light">
                We usually complete reviews within 2 to 24 hours.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {!hasIdProof ? (
                <button
                  onClick={() => router.push("/portal/profile")}
                  className="w-full sm:w-auto bg-[#c28b70] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#b07d64] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Upload ID Proof</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => router.push("/portal/profile")}
                  className="w-full sm:w-auto border border-gray-200 bg-white text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View My Profile</span>
                </button>
              )}

              <a
                href="mailto:support@soulconect.com?subject=Profile Verification Query"
                className="w-full sm:w-auto border border-gray-200 bg-white text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto bg-white min-h-screen">
      {profile?.public_verify ? (
        <>
          {/* Top action buttons */}
          <div className="mb-8 flex items-center justify-between border-b pb-4">
            <h1 className="font-serif text-3xl  text-gray-800">
              Your Match Profiles
            </h1>
            {stateProps?.getRoles?.includes("manager") && (
              <div className="flex gap-4">
                <button
                  className="bg-[#c28b70] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#b07d64] transition-colors"
                  onClick={stateProps?.onHandleClickCreateCustomer}
                >
                  + Create
                </button>
                <button
                  className="bg-[#c28b70] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#b07d64] transition-colors"
                  onClick={stateProps?.onHandleClickCreateClient}
                >
                  + Create Client
                </button>
                {stateProps?.getRoles?.includes("manager") && (
                  <button
                    className="bg-[#c28b70] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#b07d64] transition-colors"
                    onClick={stateProps?.onHandleClickCreateManager}
                  >
                    + Create Manager
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-start">
            {/* Left Sidebar */}
            <FilterSidebar
              filters={stateProps?.filters}
              onFilterChange={stateProps?.handleFilterChange}
            />

            {/* Right Content */}
            <div className="flex-1 w-full lg:w-auto mt-8 lg:mt-0">
              {/* Breadcrumbs & Title */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  <span className="hover:text-gray-800 cursor-pointer transition-colors">
                    Home
                  </span>{" "}
                  |{" "}
                  <span className="text-gray-800 font-medium cursor-pointer">
                    Latest
                  </span>{" "}
                  |{" "}
                  <span className="hover:text-gray-800 cursor-pointer transition-colors">
                    Popular
                  </span>
                </div>
                {/* <p className="text-gray-600 text-sm">
              <strong className="text-gray-800 font-medium">
                Sed Dignissim Lacinia Nunc
              </strong>{" "}
              (Fusce tellus sed augue semper porta)
            </p> */}
              </div>

              {/* Tabs */}
              {/* <div className="flex bg-gray-100 rounded overflow-hidden mb-8 w-fit border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#e50046] text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div> */}

              {/* Cards List */}
              <div className="flex flex-col gap-6">
                {stateProps?.loading ? (
                  <div className="py-12 text-center text-gray-500">
                    Loading profiles...
                  </div>
                ) : stateProps?.rows && stateProps.rows.length > 0 ? (
                  stateProps.rows.map((row: any) => (
                    <ProfileCard
                      key={row.customer_id || row.id}
                      customer={row}
                      onEdit={stateProps?.onHandleEditCustomer}
                      onDelete={stateProps?.onDeleteCustomer}
                      onView={handleView}
                      canDelete={stateProps?.getRoles?.includes("manager")}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    No profiles found.
                  </div>
                )}
              </div>

              {/* Pagination & Per Page */}
              {!stateProps?.loading &&
                stateProps?.total > 0 &&
                (() => {
                  const totalPages = Math.max(
                    1,
                    Math.ceil(
                      (stateProps?.total || 0) / (stateProps?.limit || 10),
                    ),
                  );
                  const currentPage =
                    Math.floor(
                      (stateProps?.skip || 0) / (stateProps?.limit || 10),
                    ) + 1;
                  return (
                    <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6 border-gray-100">
                      <div className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-semibold">
                          {stateProps.skip + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold">
                          {Math.min(
                            stateProps.skip + stateProps.limit,
                            stateProps.total,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold">
                          {stateProps.total}
                        </span>{" "}
                        entries
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Per Page Select */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Rows per page:
                          </span>
                          <select
                            value={stateProps?.limit}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              stateProps?.setLimit(val);
                              stateProps?.setSkip(0);
                            }}
                            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-[#c28b70]"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                          </select>
                        </div>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-2">
                          <button
                            disabled={currentPage === 1}
                            onClick={() =>
                              stateProps?.setSkip(
                                Math.max(
                                  0,
                                  (stateProps?.skip || 0) -
                                    (stateProps?.limit || 10),
                                ),
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() =>
                                stateProps?.setSkip(
                                  (page - 1) * (stateProps?.limit || 10),
                                )
                              }
                              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                                page === currentPage
                                  ? "bg-[#c28b70] text-white border border-[#c28b70]"
                                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            disabled={currentPage >= totalPages}
                            onClick={() =>
                              stateProps?.setSkip(
                                (stateProps?.skip || 0) +
                                  (stateProps?.limit || 10),
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </>
      ) : (
        <>{renderPublicVerify()}</>
      )}
      {stateProps?.isModalOpen && (
        <CustomerModal
          isOpen={stateProps?.isModalOpen}
          onClose={() => stateProps?.setIsModalOpen(false)}
          onSave={stateProps?.onSaveCustomer}
          initialData={stateProps?.editingCustomer}
          subscriptionList={stateProps?.subscriptions}
        />
      )}
    </div>
  );
}

export default CardPage;
export { CardPage };
