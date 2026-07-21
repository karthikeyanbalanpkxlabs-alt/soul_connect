"use client";

import React, { useState } from "react";
import CustomerModal from "../../../components/CustomerModal";
import usePortalPage from "./usePortalCustomerPage";
import FilterSidebar from "./FilterSidebar";
import ProfileCard from "./ProfileCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

function CardPage() {
  const stateProps = usePortalPage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Latest");
  const tabs = ["Latest", "Popular", "Trending", "Best"];

  const handleView = (id: string) => {
    router.push(`/portal/customer_detail?id=${id}`);
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto bg-white min-h-screen">
      {/* Top action buttons */}
      <div className="mb-8 flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
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
                Math.ceil((stateProps?.total || 0) / (stateProps?.limit || 10)),
              );
              const currentPage =
                Math.floor(
                  (stateProps?.skip || 0) / (stateProps?.limit || 10),
                ) + 1;
              return (
                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6 border-gray-100">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold">{stateProps.skip + 1}</span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(
                        stateProps.skip + stateProps.limit,
                        stateProps.total,
                      )}
                    </span>{" "}
                    of <span className="font-semibold">{stateProps.total}</span>{" "}
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

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
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
                        ),
                      )}

                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                          stateProps?.setSkip(
                            (stateProps?.skip || 0) + (stateProps?.limit || 10),
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

      {stateProps?.isModalOpen && (
        <CustomerModal
          isOpen={stateProps?.isModalOpen}
          onClose={() => stateProps?.setIsModalOpen(false)}
          onSave={stateProps?.onSaveCustomer}
          initialData={stateProps?.editingCustomer}
        />
      )}
    </div>
  );
}

export default CardPage;
export { CardPage };
