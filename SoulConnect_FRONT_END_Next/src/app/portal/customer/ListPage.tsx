"use client";

import React from "react";
import DynamicTable from "../../../components/DynamicTable";
import CustomerModal from "../../../components/CustomerModal";
import usePortalPage from "./usePortalCustomerPage";
import Toast from "../../../components/Toast";
import { Plus, UserPlus, ShieldPlus, Users } from "lucide-react";

function ListPage() {
  const stateProps = usePortalPage();

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
            <Users size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Customers
              </h1>
              {typeof stateProps?.total === "number" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/60">
                  {stateProps.total} total
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              View, search, filter, and manage customer records.
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-violet-500/20 hover:shadow-lg transition-all text-xs sm:text-sm cursor-pointer"
            onClick={stateProps?.onHandleClickCreateCustomer}
          >
            <Plus size={16} />
            <span>Create</span>
          </button>

          <button
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-xs sm:text-sm cursor-pointer shadow-2xs"
            onClick={stateProps?.onHandleClickCreateClient}
          >
            <UserPlus size={16} className="text-slate-500" />
            <span>Create Client</span>
          </button>

          {stateProps?.getRoles?.includes("manager") && (
            <button
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-xs sm:text-sm cursor-pointer shadow-2xs"
              onClick={stateProps?.onHandleClickCreateManager}
            >
              <ShieldPlus size={16} className="text-slate-500" />
              <span>Create Manager</span>
            </button>
          )}
        </div>
      </div>

      {/* DYNAMIC DATA TABLE */}
      <DynamicTable
        columns={stateProps?.columns}
        rows={stateProps?.rows}
        loading={stateProps?.loading}
        total={stateProps?.total}
        skip={stateProps?.skip}
        limit={stateProps?.limit}
        filters={stateProps?.filters}
        onFilterChange={stateProps?.handleFilterChange}
        onLimitChange={stateProps?.setLimit}
        onPageChange={(newSkip: any) => stateProps?.setSkip(newSkip)}
      />

      {/* MODAL */}
      {stateProps?.isModalOpen && (
        <CustomerModal
          isOpen={stateProps?.isModalOpen}
          onClose={() => stateProps?.setIsModalOpen(false)}
          onSave={stateProps?.onSaveCustomer}
          initialData={stateProps?.editingCustomer}
          subscriptionList={stateProps?.subscriptions}
        />
      )}

      {/* TOAST */}
      {stateProps?.toast && (
        <Toast
          message={stateProps.toast.message}
          type={stateProps.toast.type}
          onClose={() => stateProps.setToast(null)}
        />
      )}
    </div>
  );
}

export default ListPage;
export { ListPage };

