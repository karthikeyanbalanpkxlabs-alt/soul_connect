const KeycloakAdminClient = require("@keycloak/keycloak-admin-client").default;
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const main = async () => {
  const baseUrl = process.env.KEYCLOAK_URL || "https://auth.soulconect.com";
  console.log("Base URL:", baseUrl);
  const kcAdmin = new KeycloakAdminClient({
    baseUrl,
    realmName: "master",
  });

  try {
    await kcAdmin.auth({
      username: "admin_soulconnect",
      password: "Welcome@123",
      grantType: "password",
      clientId: "admin-cli",
    });
    console.log("Success auth master!");
  } catch (err) {
    console.error("Error authenticating to master:", err.message);
    if (err.cause) {
      console.error("Cause:", err.cause);
    }
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
  }
};

main();
