const mongoose = require('mongoose');

const MONGODB_URL = "mongodb+srv://karthimailu_db_user:Rma1zgLmDktUJ3yD@soulconnectcluster.uszzhth.mongodb.net/soul_connect_india";

// Define schema directly for verification
const customerSchema = new mongoose.Schema(
  {
    email: String,
    phone_number: String,
    phone_code: String,
    email_verified: Boolean,
    phone_verified: Boolean,
    email_otp: String,
    email_otp_expires: Date,
    phone_otp: String,
    phone_otp_expires: Date,
  },
  { collection: "customers", strict: false }
);

const Customers = mongoose.model("Customers", customerSchema);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function testVerification() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL);
    console.log("Connected successfully!");

    // Find any test customer
    let customer = await Customers.findOne({ email: "karthikeyanbalan.19f42ddba09fdf09082@gmail.com" });
    if (!customer) {
      // Find any customer
      customer = await Customers.findOne({});
    }

    if (!customer) {
      console.error("No customers found in database to run tests!");
      return;
    }

    console.log(`Using customer profile: ${customer.email} (ID: ${customer._id})`);

    // Reset verification states
    customer.email_verified = false;
    customer.phone_verified = false;
    customer.email_otp = undefined;
    customer.email_otp_expires = undefined;
    customer.phone_otp = undefined;
    customer.phone_otp_expires = undefined;
    await customer.save();
    console.log("Successfully reset email_verified and phone_verified to false.");

    // TEST 1: EMAIL OTP GENERATION AND SENDING MOCK
    console.log("\n--- TEST 1: Email Verification Flow ---");
    const emailOtp = generateOTP();
    const emailExpires = new Date(Date.now() + 5 * 60 * 1000);

    customer.email_otp = emailOtp;
    customer.email_otp_expires = emailExpires;
    await customer.save();
    console.log(`Saved email OTP (${emailOtp}) to DB. Expiry: ${emailExpires}`);

    // Verify it in DB
    let reloaded = await Customers.findById(customer._id);
    if (reloaded.email_otp === emailOtp) {
      console.log("✅ Email OTP saved correctly in database.");
    } else {
      throw new Error("❌ Email OTP mismatch in database!");
    }

    // Verify correct OTP
    if (reloaded.email_otp === emailOtp && new Date() < new Date(reloaded.email_otp_expires)) {
      reloaded.email_verified = true;
      reloaded.email_otp = undefined;
      reloaded.email_otp_expires = undefined;
      await reloaded.save();
      console.log("✅ Email OTP verified successfully! email_verified set to true.");
    } else {
      throw new Error("❌ Verification failed!");
    }

    // TEST 2: PHONE OTP GENERATION AND SENDING MOCK
    console.log("\n--- TEST 2: Phone Verification Flow ---");
    const phoneOtp = generateOTP();
    const phoneExpires = new Date(Date.now() + 5 * 60 * 1000);

    reloaded.phone_otp = phoneOtp;
    reloaded.phone_otp_expires = phoneExpires;
    await reloaded.save();
    console.log(`Saved phone OTP (${phoneOtp}) to DB. Expiry: ${phoneExpires}`);

    // Verify it in DB
    reloaded = await Customers.findById(customer._id);
    if (reloaded.phone_otp === phoneOtp) {
      console.log("✅ Phone OTP saved correctly in database.");
    } else {
      throw new Error("❌ Phone OTP mismatch in database!");
    }

    // Verify correct OTP
    if (reloaded.phone_otp === phoneOtp && new Date() < new Date(reloaded.phone_otp_expires)) {
      reloaded.phone_verified = true;
      reloaded.phone_otp = undefined;
      reloaded.phone_otp_expires = undefined;
      await reloaded.save();
      console.log("✅ Phone OTP verified successfully! phone_verified set to true.");
    } else {
      throw new Error("❌ Verification failed!");
    }

    // Final checks
    const finalCustomer = await Customers.findById(customer._id);
    console.log("\n--- Final States ---");
    console.log("email_verified:", finalCustomer.email_verified);
    console.log("phone_verified:", finalCustomer.phone_verified);
    console.log("email_otp (should be undefined):", finalCustomer.email_otp);
    console.log("phone_otp (should be undefined):", finalCustomer.phone_otp);

    if (finalCustomer.email_verified && finalCustomer.phone_verified) {
      console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
    } else {
      console.error("\n❌ TESTS FAILED!");
    }

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

testVerification();
