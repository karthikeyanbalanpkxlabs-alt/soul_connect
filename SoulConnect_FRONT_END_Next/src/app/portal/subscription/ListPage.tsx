"use client";

import React from "react";
// import { useNavigate } from "react-router-dom";
// @ts-ignore
// import DynamicTable from "../components/DynamicTable";
import DynamicTable from "../../../components/DynamicTable";
import usePortalPage from "./usePortalCustomerPage";
import Toast from "../../../components/Toast";
import SubscriptionModal from "../../../components/SubscriptionModal";

function ListPage() {
  const stateProps = usePortalPage();
  return (
    <div className="p-10">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-xl font-bold">Subscriptions</h1>
        <button
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          onClick={stateProps?.onHandleClickCreateSubscription}
        >
          + Create Package
        </button>
      </div>

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

      {stateProps?.isModalOpen && (
        <SubscriptionModal
          isOpen={stateProps?.isModalOpen}
          onClose={() => stateProps?.setIsModalOpen(false)}
          onSave={stateProps?.onSaveSubscription}
          initialData={stateProps?.editingCustomer}
        />
      )}

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
