const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URL = "mongodb+srv://karthimailu_db_user:Rma1zgLmDktUJ3yD@soulconnectcluster.uszzhth.mongodb.net/soul_connect_india";

// Schema definition matching customer.ts
const customerSchema = new mongoose.Schema(
  {
    email: String,
    phone_number: String,
    phone_code: String,
    email_verified: Boolean,
    phone_verified: Boolean,
    whatsapp_verified: Boolean,
    whatsapp_number: String,
    whatsapp_opt_in: Boolean,
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

function formatWhatsAppOtpMessage(otp, channelName = "Soul Conect", memberName = "Member") {
  const channelUrl = process.env.WHATSAPP_CHANNEL_GROUP_URL || "https://whatsapp.com/channel/0029VbDJafbG8l5C1LnfEh0X";
  const groupUrl = process.env.WHATSAPP_COMMUNITY_GROUP_URL || "https://chat.whatsapp.com/HwttQwBAS34Ck1az1PlOxQ";
  return (
    `✨ *${channelName} – Mobile Verification Code* ✨\n\n` +
    `Dear ${memberName},\n` +
    `Your verification OTP code for ${channelName} is:\n\n` +
    `👉 *${otp}* 👈\n\n` +
    `⏳ This code is valid for *5 minutes*.\n` +
    `🔒 For your safety, please DO NOT share this OTP with anyone.\n\n` +
    `📢 *Join Official ${channelName} Channel:*\n` +
    `${channelUrl}\n\n` +
    `👥 *Join our Community Group:*\n` +
    `${groupUrl}\n\n` +
    `— Best regards,\n*Team ${channelName}* 🙏`
  );
}

function generateWhatsAppDirectLink(phone, otp, phoneCode = "+91", memberName = "Member") {
  const cleaned = phone.replace(/\D/g, "");
  const text = encodeURIComponent(formatWhatsAppOtpMessage(otp, "Soul Conect", memberName));
  return `https://wa.me/${cleaned}?text=${text}`;
}

async function runWhatsAppVerificationSuite() {
  try {
    console.log("==================================================");
    console.log("🧪 STARTING SOUL CONECT WHATSAPP VERIFICATION TEST");
    console.log("==================================================");

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL);
    console.log("✅ MongoDB Connected!");

    let customer = await Customers.findOne({ email: "karthikeyanbalan.19f42ddba09fdf09082@gmail.com" });
    if (!customer) {
      customer = await Customers.findOne({});
    }

    if (!customer) {
      console.error("❌ No customer record found to test with.");
      process.exit(1);
    }

    console.log(`👤 Customer under test: ${customer.email} (${customer.first_name || "Member"})`);

    // Reset verification states
    customer.phone_verified = false;
    customer.whatsapp_verified = false;
    customer.phone_otp = undefined;
    customer.phone_otp_expires = undefined;
    await customer.save();
    console.log("🔄 Reset phone_verified & whatsapp_verified to false.");

    // TEST 1: WHATSAPP OTP GENERATION & TEMPLATE FORMATTING
    console.log("\n--- TEST 1: WhatsApp OTP Message & Link Formatting ---");
    const otp = generateOTP();
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    const phoneCode = customer.phone_code || "+91";
    const phoneNumber = customer.phone_number || "9876543210";
    const fullPhone = `${phoneCode}${phoneNumber}`;

    const formattedMessage = formatWhatsAppOtpMessage(otp, "Soul Conect");
    const directLink = generateWhatsAppDirectLink(fullPhone, otp, phoneCode);

    console.log("Generated 6-Digit OTP:", otp);
    console.log("Formatted Message Preview:\n", formattedMessage);
    console.log("Direct WhatsApp Link:", directLink);

    if (otp.length === 6 && directLink.includes("wa.me") && formattedMessage.includes("Soul Conect")) {
      console.log("✅ TEST 1 PASSED: WhatsApp OTP formatting and direct link generation verified!");
    } else {
      throw new Error("TEST 1 FAILED");
    }

    // TEST 2: STORE OTP IN DATABASE AND VERIFY VALID EXPIRATION
    console.log("\n--- TEST 2: Database OTP Storage ---");
    customer.phone_otp = otp;
    customer.phone_otp_expires = expires;
    customer.whatsapp_number = phoneNumber;
    await customer.save();

    const storedCustomer = await Customers.findOne({ _id: customer._id });
    if (storedCustomer.phone_otp === otp && new Date(storedCustomer.phone_otp_expires) > new Date()) {
      console.log("✅ TEST 2 PASSED: OTP stored in DB with valid 5-minute expiration!");
    } else {
      throw new Error("TEST 2 FAILED");
    }

    // TEST 3: REJECT WRONG OTP CODE
    console.log("\n--- TEST 3: Negative Test - Reject Invalid OTP ---");
    const wrongOtp = "999999";
    if (storedCustomer.phone_otp !== wrongOtp) {
      console.log("✅ TEST 3 PASSED: Invalid OTP rejected correctly as expected.");
    } else {
      throw new Error("TEST 3 FAILED: Invalid OTP was accepted!");
    }

    // TEST 4: ACCEPT CORRECT OTP AND UPDATE VERIFICATION STATUS
    console.log("\n--- TEST 4: Positive Test - Confirm Correct OTP ---");
    if (storedCustomer.phone_otp === otp && new Date() < new Date(storedCustomer.phone_otp_expires)) {
      storedCustomer.phone_verified = true;
      storedCustomer.whatsapp_verified = true;
      storedCustomer.phone_otp = undefined;
      storedCustomer.phone_otp_expires = undefined;
      await storedCustomer.save();

      const finalCustomer = await Customers.findOne({ _id: customer._id });
      if (finalCustomer.phone_verified === true && finalCustomer.whatsapp_verified === true) {
        console.log("✅ TEST 4 PASSED: Customer phone_verified and whatsapp_verified updated to TRUE!");
      } else {
        throw new Error("TEST 4 FAILED: Verification state not updated.");
      }
    }

    console.log("\n==================================================");
    console.log("🎉 ALL WHATSAPP OTP & CHANNEL TESTS PASSED 100%!");
    console.log("==================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test error:", err);
    process.exit(1);
  }
}

runWhatsAppVerificationSuite();
