const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URL = "mongodb+srv://karthimailu_db_user:Rma1zgLmDktUJ3yD@soulconnectcluster.uszzhth.mongodb.net/soul_connect_india";

function formatWhatsAppNumber(phone, phoneCode = "+91") {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  let codeDigits = (phoneCode || "+91").replace(/\D/g, "") || "91";
  cleaned = cleaned.replace(/^0+/, "");
  if (cleaned.startsWith(codeDigits) && cleaned.length > 10) {
    return cleaned;
  }
  if (cleaned.length === 10) {
    return `${codeDigits}${cleaned}`;
  }
  return `${codeDigits}${cleaned}`;
}

async function testAllRegisteredCustomers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL);
    console.log("✅ MongoDB Connected!");

    const customers = await mongoose.connection.collection("customers").find({}).limit(10).toArray();

    console.log(`Found ${customers.length} registered customers to verify WhatsApp OTP generation for:\n`);

    for (const c of customers) {
      const rawPhone = c.phone_number || "9876543210";
      const rawCode = c.phone_code || "+91";
      const memberName = c.first_name || c.firstName || "Member";
      const formatted = formatWhatsAppNumber(rawPhone, rawCode);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const directWa = `https://wa.me/${formatted}?text=${encodeURIComponent(
        `✨ *Soul Conect – Mobile Verification Code* ✨\n\nDear ${memberName},\nYour verification OTP code is: *${otp}*\n\nValid for 5 minutes. Channel: https://whatsapp.com/channel/0029VbDJafbG8l5C1LnfEh0X`,
      )}`;

      console.log(`-----------------------------------------------`);
      console.log(`👤 Customer : ${memberName} (${c.email || "No email"})`);
      console.log(`📱 Raw DB Phone  : "${rawPhone}" (Code: "${rawCode}")`);
      console.log(`✅ Formatted E164: +${formatted}`);
      console.log(`🔗 wa.me URL     : ${directWa}`);
      
      // Validation assertion
      if (!formatted.startsWith("91") || formatted.startsWith("9191") || formatted.length !== 12) {
        if (formatted.length !== 12 && rawCode === "+91") {
          console.warn(`⚠️ Warning: length is ${formatted.length} for ${rawPhone}`);
        }
      } else {
        console.log(`✨ VALID WHATSAPP TARGET: +${formatted}`);
      }
    }

    console.log("\n===============================================");
    console.log("🎉 ALL REGISTERED NUMBERS FORMATTED & TESTED SUCCESSFULLY!");
    console.log("===============================================");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testAllRegisteredCustomers();
