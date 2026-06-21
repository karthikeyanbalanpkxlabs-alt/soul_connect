import keycloak from "../keycloak";
import React from "react";
import { useNavigate } from "react-router-dom";
function PortalCustomerPage() {
  const navigate = useNavigate();
  const [getRoles, setRoles] = React.useState([]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Customer Page</h1>
      <button
        style={{ marginRight: 10, color: "#fff" }}
        onClick={() => navigate("/portal")}
      >
        Back
      </button>
    </div>
  );
}

export default PortalCustomerPage;
