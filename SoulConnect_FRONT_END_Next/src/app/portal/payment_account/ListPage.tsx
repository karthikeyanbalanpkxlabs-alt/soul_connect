"use client";

import React from "react";
import DynamicTable, { TableColumn } from "@/components/DynamicTable";
import PaymentAccountModal from "@/components/PaymentAccountModal";
import PaymentAccountDetailModal from "@/components/PaymentAccountDetailModal";
import Toast from "@/components/Toast";
import usePortalPaymentAccountPage from "./usePortalPaymentAccountPage";
import { Eye, Pencil, Power, ShieldAlert, Plus, CreditCard } from "lucide-react";

function ListPage() {
  const stateProps = usePortalPaymentAccountPage();

  // If user is not manager, restrict access
  if (!stateProps.loading && !stateProps.isManager) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Manager Access Only</h2>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          The Payment Account Module is restricted to Manager users. You do not have permission to access or modify gateway configurations.
        </p>
      </div>
    );
  }

  const columns: TableColumn[] = [
    {
      key: "account_name",
      label: "Account Name",
      isFilterable: true,
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 font-bold text-xs uppercase">
            {(row.provider || "P").slice(0, 2)}
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">
              {row.account_name}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              ID: {row._id || row.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "provider",
      label: "Provider",
      isFilterable: true,
      render: (row: any) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 capitalize">
          {row.provider || "N/A"}
        </span>
      ),
    },
    {
      key: "environment",
      label: "Environment",
      isFilterable: false,
      render: (row: any) => {
        const env = row.config?.environment || "test";
        const isLive = env === "live";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
              isLive
                ? "bg-amber-100 text-amber-800 font-bold"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {env}
          </span>
        );
      },
    },
    {
      key: "currency",
      label: "Currency",
      isFilterable: false,
      render: (row: any) => (
        <span className="font-medium text-gray-700">
          {row.config?.currency || "INR"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      isFilterable: true,
      render: (row: any) => {
        const isActive = !!row.is_active;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-emerald-100 text-emerald-700 font-semibold"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Created Date",
      isFilterable: false,
      render: (row: any) => (
        <span className="text-xs text-gray-600">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Actions",
      isFilterable: false,
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => stateProps.onPreviewAccount(row)}
            className="text-violet-600 hover:text-violet-900 transition flex items-center gap-1 font-medium cursor-pointer bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg text-xs"
            title="Inspect Account Config"
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={() => stateProps.onHandleEditAccount(row)}
            className="text-gray-700 hover:text-gray-900 transition flex items-center gap-1 font-medium cursor-pointer border border-gray-200 hover:bg-gray-50 px-2.5 py-1 rounded-lg text-xs"
            title="Edit Account Config"
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            onClick={() => stateProps.onToggleStatus(row)}
            className={`transition flex items-center gap-1 font-medium cursor-pointer px-2.5 py-1 rounded-lg text-xs ${
              row.is_active
                ? "text-rose-600 hover:bg-rose-50 border border-rose-200"
                : "text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
            }`}
            title={row.is_active ? "Deactivate Account" : "Activate Account"}
          >
            <Power size={13} />
            {row.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={24} className="text-violet-600" />
            Payment Accounts
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage payment gateway integration accounts, API keys, and environment settings
          </p>
        </div>

        <button
          onClick={stateProps.onHandleCreateAccount}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          Create Payment Account
        </button>
      </div>

      {/* Table */}
      <DynamicTable
        columns={columns}
        rows={stateProps.rows}
        loading={stateProps.loading}
        total={stateProps.total}
        skip={stateProps.skip}
        limit={stateProps.limit}
        filters={stateProps.filters}
        onFilterChange={stateProps.handleFilterChange}
        onLimitChange={stateProps.setLimit}
        onPageChange={(newSkip: any) => stateProps.setSkip(newSkip)}
        sortField={stateProps.sortField}
        sortOrder={stateProps.sortOrder}
        onSortChange={stateProps.handleSortChange}
      />

      {/* Create / Edit Modal */}
      {stateProps.isModalOpen && (
        <PaymentAccountModal
          isOpen={stateProps.isModalOpen}
          onClose={() => stateProps.setIsModalOpen(false)}
          onSave={stateProps.onSaveAccount}
          initialData={stateProps.editingAccount}
        />
      )}

      {/* Detail Inspector Modal */}
      {stateProps.isPreviewModalOpen && stateProps.selectedAccount && (
        <PaymentAccountDetailModal
          isOpen={stateProps.isPreviewModalOpen}
          onClose={() => stateProps.setIsPreviewModalOpen(false)}
          account={stateProps.selectedAccount}
        />
      )}

      {/* Toast Notification */}
      {stateProps.toast && (
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
