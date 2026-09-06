const dotenv = require('dotenv');
dotenv.config();

async function test2FactorSMS() {
  const apiKey = process.env.TWOFACTOR_API_KEY || process.env.TOFACT;
  console.log("Using 2Factor API Key:", apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT FOUND');

  const phone = "919999999999";
  const otp = "123456";
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}`;

  console.log(`Sending GET request to 2Factor.in API: ${url.replace(apiKey, '[KEY_HIDDEN]')}`);

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("2Factor API Response:", data);
  } catch (err) {
    console.error("2Factor test error:", err.message);
  }
}

test2FactorSMS();
