"use client";

import React from "react";
// import { useNavigate } from "react-router-dom";
// @ts-ignore
// import DynamicTable from "../components/DynamicTable";
import DynamicTable from "../../../components/DynamicTable";
import CustomerModal from "../../../components/CustomerModal";
import usePortalPage from "./usePortalCustomerPage";
import Toast from "../../../components/Toast";

function ListPage() {
  const stateProps = usePortalPage();
  return (
    <div className="p-10">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-xl font-bold">Transactions</h1>
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
