import keycloak from "../../keycloak";
import React from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import videoUrl from "./video.mp4";
// import DynamicTable from "../components/DynamicTable";
import DynamicTable from "../../components/DynamicTable";
import usePortalPage from "./usePortalCustomerPage";

function PortalPage() {
  const stateProps = usePortalPage();
  return (
    <div className="p-10">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-xl font-bold">Customers</h1>
        <div>
          <button
            style={{ marginRight: 10, color: "#fff" }}
            onClick={stateProps?.onHandleClickCreateCustomer}
          >
            + Create Customer
          </button>
          {stateProps?.getRoles?.includes("manager") && (
            <button
              style={{ marginRight: 10, color: "#fff" }}
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
        onPageChange={(newSkip) => stateProps?.setSkip(newSkip)}
      />
    </div>
  );
}

export default PortalPage;
