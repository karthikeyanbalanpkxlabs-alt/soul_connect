import keycloak from "../keycloak";
import React from "react";
function PortalPage() {

  React.useEffect(() => {
    if (keycloak.authenticated) {
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
      <p>Welcome, {keycloak.tokenParsed?.preferred_username}</p>
      <button onClick={() => keycloak.logout()}>Logout</button>
    </div>
  );
}

export default PortalPage;
