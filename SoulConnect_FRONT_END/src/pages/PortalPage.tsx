import keycloak from "../keycloak";
import React from "react";
import { useNavigate } from "react-router-dom";

const generateId = () => {
  return Date.now().toString(16) + Math.random().toString(16).substring(2, 10);
};

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

  // React.useEffect(() => {
  //   if (keycloak.authenticated) {
  //     const tokenParsed: any = keycloak.tokenParsed;
  //     let roles: any = tokenParsed?.realm_access?.roles;
  //     roles = roles.filter(
  //       (itm: any) => itm === "manager_admin" || itm === "customer_admin",
  //     );
  //     roles = roles.length > 0 ? roles[0] : "customer_admin";
  //     setRoles(roles);
  //     localStorage.setItem("roles", roles || "");
  //     localStorage.setItem("token", keycloak?.token || "");
  //     const token = keycloak?.token;
  //     fetch("http://localhost:3000/api/send-email", {
  //       // fetch("http://127.0.0.1:3000/api/send-email", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         to: "karthimailu@gmail.com",
  //         subject: "Hello BK!",
  //         message: "this email is sent from SoulConnect Portal",
  //       }),
  //     })
  //       .then((r) => r.json())
  //       .then((data) => console.log("customer_list data response:", data))
  //       .catch((e) => console.error("Error fetching customer_list:", e));
  //   }
  // }, []);

  React.useEffect(() => {
    if (keycloak.authenticated) {
      const token = keycloak?.token;
      let dataGenerateId = generateId();
      fetch("http://localhost:3000/api/customer_create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: "cid_" + dataGenerateId,
          first_name: "Jessica",
          last_name: "John",
          dob: "02-12-1999",
          gender: "female",
          phone_number: "8870688606",
          phone_code: "+91",
          // email: "jessica@gmail.com",
          email: `john.doe.${Date.now()}@gmail.com`,
          district: "coimbatore",
          taluk_town: "r.spuram",
          state: "tamilnadu",
          zipcode: "641001",
          religion: "hindhu",
          caste: "bc",
          mother_tongue: "tamil",
          maritial_status: "unmarried",
          education: "ba",
          profession: "employee",
          annual_income: "10000",
          height: "5.2",
          about_self: "NA",
          partner_preference: "NA",
          subscription_type: "guest",
          subscription_view_access: 4,
          image: [
            {
              url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
              default: true,
            },
            {
              url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            },
          ],
          video: "",
          transaction: [],
          public_verify: true,
          keycloakId: dataGenerateId,
          firstName: "John",
          lastName: "Doe",
          // image: [
          //   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          // ],
        }),
      })
        .then((r) => r.json())
        .then((data) => console.log("customer_create response:", data))
        .catch((e) => console.error("Error creating customer:", e));
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>PORTAL</h1>
      <p>
        Welcome, {keycloak.tokenParsed?.preferred_username} and your role is{" "}
        {getRoles}
      </p>
      <button style={{ marginRight: 10 }} onClick={() => keycloak.logout()}>
        Logout
      </button>
      <button onClick={() => navigate("/portal/customer")}>Customer</button>
    </div>
  );
}

export default PortalPage;
