# `/makePayment` API Specification

Endpoint: `POST /api/makePayment` or `POST /api/public/makePayment`

---

## 1. Positive Flow (Payment Success / Paid)

### Request (`POST /api/makePayment`)
```json
{
  "email": "customer@gmail.com",
  "plan": "Soulmate",
  "amount": 999,
  "total_amount": 999,
  "tax": 0,
  "discount": 0,
  "payment_method": "Razorpay",
  "payment_id": "pay_N123456789",
  "order_id": "ord_O987654321",
  "invoice_no": "INV-20260808-01",
  "payment_status": "success",
  "payment_type": "online"
}
```

### Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "message": "Payment transaction recorded successfully",
  "data": {
    "customer_id": "66f123456789...",
    "email": "customer@gmail.com",
    "subscription_type": "Soulmate",
    "transaction": {
      "current_plan": true,
      "plan": "Soulmate",
      "purchase_date": "2026-08-08T07:10:00.000Z",
      "expired_date": "2027-08-08T07:10:00.000Z",
      "summary": {
        "invoice_no": "INV-20260808-01",
        "order_id": "ord_O987654321",
        "payment_id": "pay_N123456789",
        "payment_method": "Razorpay",
        "payment_status": "success",
        "payment_type": "online",
        "amount": 999,
        "tax": 0,
        "discount": 0,
        "total_amount": 999,
        "transaction_date": "2026-08-08T07:10:00.000Z"
      }
    }
  }
}
```

---

## 2. Negative Flow (Payment Failed / Declined / Cancelled)

### Request (`POST /api/makePayment`)
```json
{
  "email": "customer@gmail.com",
  "plan": "Soulmate",
  "amount": 999,
  "total_amount": 999,
  "payment_method": "Razorpay",
  "payment_id": "pay_FAILED_98765",
  "order_id": "ord_O987654321",
  "invoice_no": "INV-20260808-02",
  "payment_status": "failed",
  "error_code": "BAD_REQUEST_PAYMENT_FAILED",
  "error_description": "Card authorization failed due to insufficient funds"
}
```

### Response (`HTTP 200 OK`)
```json
{
  "success": false,
  "message": "Payment failed. Failed transaction recorded.",
  "data": {
    "customer_id": "66f123456789...",
    "email": "customer@gmail.com",
    "subscription_type": "Standard",
    "transaction": {
      "current_plan": false,
      "plan": "Soulmate",
      "purchase_date": "2026-08-08T07:17:00.000Z",
      "expired_date": "2027-08-08T07:17:00.000Z",
      "summary": {
        "invoice_no": "INV-20260808-02",
        "order_id": "ord_O987654321",
        "payment_id": "pay_FAILED_98765",
        "payment_method": "Razorpay",
        "payment_status": "failed",
        "payment_type": "online",
        "amount": 999,
        "tax": 0,
        "discount": 0,
        "total_amount": 999,
        "transaction_date": "2026-08-08T07:17:00.000Z",
        "error_code": "BAD_REQUEST_PAYMENT_FAILED",
        "error_description": "Card authorization failed due to insufficient funds"
      }
    },
    "error_code": "BAD_REQUEST_PAYMENT_FAILED",
    "error_description": "Card authorization failed due to insufficient funds"
  }
}
```
