# Combined `/makePayment` API Specification & Fetch Examples

The `/makePayment` endpoint (`POST /api/makePayment` or `POST /api/public/makePayment`) is now a **Single Combined Endpoint** that handles both:
1. **Order Creation** (`action: "create_order"`)
2. **Payment Verification & Transaction Recording** (`action: "verify_payment"`)

---

## 1. Single Combined API Client Function (`makePayment`)

```javascript
async function makePayment(payload) {
  const res = await fetch("http://localhost:5000/api/public/makePayment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Payment API request failed");
  }
  return data;
}
```

---

## 2. Usage Examples with Combined `/makePayment` Endpoint

### Step 1: Create Razorpay Order
```javascript
// Send action: "create_order" to /makePayment
const orderResponse = await makePayment({
  action: "create_order",
  email: "customer@gmail.com",
  plan: "Soulmate",
  amount: 999,
  provider: "razorpay",
});

console.log(orderResponse.data);
// Output: { order_id: "order_N12345", amount: 999, amount_in_paise: 99900, currency: "INR", key_id: "rzp_test_xxx" }
```

### Step 2A: Verify Successful Payment (Positive Flow)
```javascript
// Send action: "verify_payment" (or omit action) with razorpay fields to /makePayment
const successResponse = await makePayment({
  action: "verify_payment",
  email: "customer@gmail.com",
  plan: "Soulmate",
  amount: 999,
  provider: "razorpay",
  payment_status: "success",
  payment_method: "Razorpay",
  razorpay_order_id: "order_N12345",
  razorpay_payment_id: "pay_P98765",
  razorpay_signature: "a1b2c3d4e5f6...",
});

console.log(successResponse);
// Output: { success: true, message: "Payment transaction verified and recorded successfully", data: { ... } }
```

### Step 2B: Record Failed/Cancelled Payment (Negative Flow)
```javascript
// Send payment_status: "failed" to /makePayment
const failedResponse = await makePayment({
  action: "verify_payment",
  email: "customer@gmail.com",
  plan: "Soulmate",
  amount: 999,
  provider: "razorpay",
  payment_status: "failed",
  error_code: "BAD_REQUEST_PAYMENT_FAILED",
  error_description: "User cancelled payment or card authorization failed",
});

console.log(failedResponse);
// Output: { success: false, message: "Payment failed. Failed transaction recorded.", data: { ... } }
```

---

## 3. Complete End-to-End Client Integration Example

```javascript
async function startUnifiedCheckout(email, plan, amount) {
  try {
    // 1. Create Order via /makePayment
    const orderRes = await makePayment({
      action: "create_order",
      email,
      plan,
      amount,
      provider: "razorpay",
    });

    const orderData = orderRes.data;

    // 2. Open Razorpay Checkout Modal
    const options = {
      key: orderData.key_id,
      amount: orderData.amount_in_paise,
      currency: orderData.currency,
      name: "SoulConnect",
      description: `Plan: ${plan}`,
      order_id: orderData.order_id,
      handler: async function (response) {
        // 3. Positive Flow: Verify via /makePayment
        const verifyRes = await makePayment({
          action: "verify_payment",
          email,
          plan,
          amount,
          provider: "razorpay",
          payment_status: "success",
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verifyRes.success) {
          alert("Payment verified and plan activated successfully!");
        } else {
          alert("Payment verification failed: " + verifyRes.message);
        }
      },
      modal: {
        ondismiss: async function () {
          // 4. Negative Flow: Cancelled Modal via /makePayment
          await makePayment({
            action: "verify_payment",
            email,
            plan,
            amount,
            provider: "razorpay",
            payment_status: "failed",
            error_code: "PAYMENT_CANCELLED",
            error_description: "User dismissed payment modal",
          });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", async function (response) {
      // 5. Negative Flow: Failed Attempt via /makePayment
      await makePayment({
        action: "verify_payment",
        email,
        plan,
        amount,
        provider: "razorpay",
        payment_status: "failed",
        error_code: response.error.code,
        error_description: response.error.description,
      });
    });

    rzp.open();
  } catch (err) {
    console.error("Unified Checkout Error:", err.message);
    alert(err.message);
  }
}
```
