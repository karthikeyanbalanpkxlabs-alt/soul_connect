const http = require("http");

// Test against Express app directly
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URL = "mongodb+srv://karthimailu_db_user:Rma1zgLmDktUJ3yD@soulconnectcluster.uszzhth.mongodb.net/soul_connect_india";

async function testBackendAPIWiseFlow() {
  try {
    console.log("==================================================");
    console.log("🧪 TESTING PROFILE PAGE TO BACKEND API-WISE FLOW");
    console.log("==================================================");

    await mongoose.connect(MONGODB_URL);
    console.log("✅ MongoDB Connected!");

    // Import controllers
    const { handleSendOTP, handleVerifyOTP } = require("./dist/controllers/verificationController");

    const app = express();
    app.use(express.json());
    app.post("/api/public/verification/send-otp", handleSendOTP);
    app.post("/api/public/verification/verify-otp", handleVerifyOTP);

    const server = app.listen(3099, async () => {
      console.log("✅ Test Server listening on http://localhost:3099");

      // 1. STEP 1: Profile page initiates send-otp for registered customer
      console.log("\n--- STEP 1: Frontend Profile Page calls /api/public/verification/send-otp ---");
      const sendPayload = JSON.stringify({
        email: "karthimailu@gmail.com",
        phone_number: "8870688606",
        phone_code: "+91",
        type: "phone",
      });

      const sendRes = await fetch("http://localhost:3099/api/public/verification/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: sendPayload,
      });

      const sendData = await sendRes.json();
      console.log("Backend Response:", sendData);

      if (!sendData.success || !sendData.otp || !sendData.direct_link) {
        throw new Error("send-otp failed");
      }

      console.log(`✅ STEP 1 PASSED: Generated OTP: ${sendData.otp}`);
      console.log(`📲 WhatsApp Link targeting member: ${sendData.direct_link}`);

      // 2. STEP 2: Frontend Profile Page calls /api/public/verification/verify-otp with the code
      console.log("\n--- STEP 2: Frontend Profile Page calls /api/public/verification/verify-otp ---");
      const verifyPayload = JSON.stringify({
        email: "karthimailu@gmail.com",
        phone_number: "8870688606",
        type: "phone",
        otp: sendData.otp,
      });

      const verifyRes = await fetch("http://localhost:3099/api/public/verification/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: verifyPayload,
      });

      const verifyData = await verifyRes.json();
      console.log("Backend Response:", verifyData);

      if (!verifyData.success) {
        throw new Error("verify-otp failed");
      }

      console.log("✅ STEP 2 PASSED: Verified successfully on backend!");

      // 3. STEP 3: Check database document
      const customer = await mongoose.connection.collection("customers").findOne({ email: "karthimailu@gmail.com" });
      console.log(`\n--- STEP 3: Verified DB Document Status ---`);
      console.log(`Customer: ${customer.first_name || customer.firstName}`);
      console.log(`Phone: ${customer.phone_code} ${customer.phone_number}`);
      console.log(`phone_verified: ${customer.phone_verified}`);
      console.log(`whatsapp_verified: ${customer.whatsapp_verified}`);

      if (customer.phone_verified && customer.whatsapp_verified) {
        console.log("\n🎉 END-TO-END API-WISE FLOW PASSED 100%!");
      }

      server.close();
      process.exit(0);
    });

  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

testBackendAPIWiseFlow();
