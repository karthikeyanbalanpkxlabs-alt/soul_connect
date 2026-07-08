"use client";

import React from "react";
// import { useNavigate } from "react-router-dom";
// @ts-ignore
// import DynamicTable from "../components/DynamicTable";
import DynamicTable from "../../../components/DynamicTable";
import CustomerModal from "../../../components/CustomerModal";
import usePortalPage from "./usePortalCustomerPage";

function PortalPage() {
  const stateProps = usePortalPage();
  return (
    <div className="p-10">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-xl font-bold">Customers</h1>
        <div>
          <button
            className="color-black"
            style={{ cursor: "pointer", marginRight: 10, color: "#000000ff" }}
            onClick={stateProps?.onHandleClickCreateCustomer}
          >
            + Create
          </button>
          <button
            className="color-black"
            style={{
              cursor: "pointer",
              marginRight: 10,
              color: "#000000ff",
            }}
            onClick={stateProps?.onHandleClickCreateClient}
          >
            + Create Client
          </button>
          {stateProps?.getRoles?.includes("manager") && (
            <button
              className="color-black"
              style={{ cursor: "pointer", marginRight: 10, color: "#000000ff" }}
              onClick={stateProps?.onHandleClickCreateManager}
            >
              + Create Manager
            </button>
          )}
        </div>
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

export default PortalPage;
