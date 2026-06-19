import keycloak from "../keycloak";
import React from "react";
import { useNavigate } from "react-router-dom";
function PortalPage() {
  const [getRoles, setRoles] = React.useState([]);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (keycloak.authenticated) {
      const tokenParsed: any = keycloak.tokenParsed;
      let roles: any = tokenParsed?.realm_access?.roles;
      roles = roles.filter(
        (itm: any) => itm === "manager_admin" || itm === "customer_admin",
      );
      roles = roles.length > 0 ? roles[0] : "customer_admin";
      setRoles(roles);
      localStorage.setItem("roles", roles || "");
      localStorage.setItem("token", keycloak?.token || "");
      const token = keycloak?.token;
      fetch("http://localhost:3000/api/customer_list", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
        .then((r) => r.json())
        .then((data) => console.log("customer_list data response:", data))
        .catch((e) => console.error("Error fetching customer_list:", e));
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>PORTAL</h1>
      <p>
        Welcome, {keycloak.tokenParsed?.preferred_username} and your role is{" "}
        {getRoles}
      </p>
      <button onClick={() => keycloak.logout()}>Logout</button>
      <button onClick={() => navigate("/portal/customer")}>Customer</button>
    </div>
  );
}

export default PortalPage;
