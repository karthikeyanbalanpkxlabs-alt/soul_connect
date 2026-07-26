import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

export const GLOBAL_DETAILS = {
  username: "admin_soulconnect",
  password: "Welcome@123",
};

export const kcAdminClient = new KeycloakAdminClient({
  baseUrl: process.env.KEYCLOAK_URL || "http://localhost:4000",
  realmName: process.env.KEYCLOAK_REALM || "soul_connect",
});

export const connectAdminClient = async () => {
  const baseUrl = process.env.KEYCLOAK_URL || "http://localhost:4000";
  const realm = process.env.KEYCLOAK_REALM || "soul_connect";
  const clientId = process.env.KEYCLOAK_CLIENT_ID || "soul_connect_c";
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  console.log(
    `📡 Attempting Test 2 Keycloak Admin Auth: [${baseUrl}] Realm: [${realm}] Client: [${clientId}]`,
  );

  if (!clientSecret) {
    console.error("❌ KEYCLOAK_CLIENT_SECRET is missing in .env!");
    return;
  }

  try {
    await kcAdminClient.auth({
      grantType: "client_credentials",
      clientId,
      clientSecret,
    });
    console.log("✅ Keycloak Admin Client Authenticated Successfully!");
  } catch (error: any) {
    console.error("❌ Keycloak Admin Client Authentication Failed:");
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error(
        "   Error:",
        error.response.data?.error || error.response.statusText,
      );
      console.error(
        "   Description:",
        error.response.data?.error_description || "No description provided",
      );
    } else {
      console.error("   Error Message:", error.message);
    }
  }
};

export const getMasterAdminClient = async () => {
  const client = new KeycloakAdminClient({
    baseUrl: process.env.KEYCLOAK_URL || "http://localhost:4000",
    realmName: "master",
  });
  await client.auth({
    ...GLOBAL_DETAILS,
    grantType: "password",
    clientId: "admin-cli",
  });
  client.setConfig({
    realmName: process.env.KEYCLOAK_REALM || "soul_connect",
  });
  return client;
};

// Re-authenticate every 50 seconds to keep the admin session alive
setInterval(connectAdminClient, 50000);
connectAdminClient();
