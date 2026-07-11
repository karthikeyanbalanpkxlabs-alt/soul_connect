const { KeycloakAdminClient } = require("@keycloak/keycloak-admin-client");

async function test() {
  const kcAdminClient = new KeycloakAdminClient({
    baseUrl: "http://103.235.105.43:4000",
    realmName: "sashti",
  });

  try {
    await kcAdminClient.auth({
      grantType: "client_credentials",
      clientId: "sashti_backend",
      clientSecret: "Xa1K8JJyKsfKESlaSAxpQapOTJwR79UY", // This is the secret from their .env
    });
    console.log("✅ Authenticated as sashti_backend successfully!");

    // Try to list users (requires view-users role)
    const users = await kcAdminClient.users.find();
    console.log(
      `✅ Found ${users.length} users. You have the 'view-users' role.`,
    );

    // Try to create a dummy user to test 'manage-users' role
    const dummyEmail = `test_${Date.now()}@example.com`;
    const kcUser = await kcAdminClient.users.create({
      username: dummyEmail,
      email: dummyEmail,
      firstName: "Test",
      lastName: "Test",
      enabled: true,
      emailVerified: true,
    });
    console.log("✅ Created user successfully! ID:", kcUser.id);

    // Clean up dummy user
    await kcAdminClient.users.del({ id: kcUser.id });
    console.log("✅ Cleaned up dummy user.");
  } catch (err) {
    if (err.response) {
      console.error("❌ FAILED WITH STATUS:", err.response.status);
      console.error("   Message:", err.response.data);
    } else {
      console.error("❌ FAILED:", err.message);
    }
  }
}

test();
