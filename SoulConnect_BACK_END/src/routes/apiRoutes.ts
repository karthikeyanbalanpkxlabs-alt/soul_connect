import { Router } from "express";
import { keycloak } from "../keycloak-config";
import {
  handleCustomerList,
  handleCustomerTransactionList,
  handleCustomerDetail,
  handleCustomerDetailGet,
  handleProfileDetail,
  handleProfileDetailGet,
  handleCustomerEdit,
  handleCustomerDelete,
  handleCustomerCreate,
  handleSendInterest,
  handleGetInterestedList,
} from "../controllers/customerController";
import {
  handleSubscriptionCreate,
  handleSubscriptionEdit,
  handleSubscriptionGet,
} from "../controllers/subscriptionController";
import { handleDashboardAnalytics } from "../controllers/analyticsController";
import {
  handleGetUsers,
  handleCreateUser,
  handleUpdateUser,
  handleUserCreate,
  handleUserEdit,
  handleUserDelete,
} from "../controllers/userController";
import { handleSendEmail } from "../controllers/emailController";
import {
  handleSendOTP,
  handleVerifyOTP,
} from "../controllers/verificationController";
import {
  handlePaymentAccountList,
  handlePaymentAccountCreate,
  handlePaymentAccountEdit,
  handlePaymentAccountDetail,
  handlePaymentAccountDetailGet,
} from "../controllers/paymentAccountController";
import {
  handleMakePayment,
  handleCreateRazorpayOrder,
  handleRazorpayWebhook,
  handleOmniwareInitiate,
  handleOmniwareRedirect,
  handleOmniwareCallback,
  handleOmniwareWebhook,
} from "../controllers/paymentController";
import { handleForgotPassword, handleResetPassword } from "../controllers/authController";
import {
  handleMediaUpload,
  mediaUploadMiddleware,
} from "../controllers/mediaUploadController";

const router = Router();

// --- PROTECTED ROUTES ---

router.post(
  "/transactions_list",
  keycloak.protect(),
  handleCustomerTransactionList,
);
router.get(
  "/transactions_detail/:id",
  keycloak.protect(),
  handleCustomerDetailGet,
);

router.post("/customer_list", keycloak.protect(), (req, res) =>
  handleCustomerList(req, res, false),
);

router.post("/customer_detail", keycloak.protect(), handleCustomerDetail);
router.get("/customer_detail/:id", keycloak.protect(), handleCustomerDetailGet);

router.post("/profile_detail", keycloak.protect(), handleProfileDetail);
router.get("/profile_detail", keycloak.protect(), handleProfileDetail);
router.get("/profile_detail/:id", keycloak.protect(), handleProfileDetailGet);
router.post("/customer_edit", keycloak.protect(), handleCustomerEdit);
router.post("/customer_delete", keycloak.protect(), handleCustomerDelete);
router.post("/customer_create", keycloak.protect(), handleCustomerCreate);

router.post("/user_create", keycloak.protect(), handleUserCreate);
router.post("/user_edit", keycloak.protect(), handleUserEdit);
router.post("/user_delete", keycloak.protect(), handleUserDelete);
router.post("/send_interest", keycloak.protect(), handleSendInterest);
router.post("/interested_list", keycloak.protect(), handleGetInterestedList);
router.get("/interested_list", keycloak.protect(), handleGetInterestedList);
router.get("/subscription", keycloak.protect(), handleSubscriptionGet);
router.get("/subscriptions", keycloak.protect(), handleSubscriptionGet);
router.post(
  "/subscription/create",
  keycloak.protect(),
  handleSubscriptionCreate,
);
router.post("/subscription/edit", keycloak.protect(), handleSubscriptionEdit);
router.get(
  "/dashboard_analytics",
  keycloak.protect(),
  handleDashboardAnalytics,
);
router.post(
  "/dashboard_analytics",
  keycloak.protect(),
  handleDashboardAnalytics,
);

router.get("/users", keycloak.protect(), handleGetUsers);
router.post("/users", keycloak.protect(), handleCreateUser);
router.put("/users/:id", keycloak.protect(), handleUpdateUser);

// --- PAYMENT ACCOUNT ROUTES ---
router.post(
  "/payment_account_list",
  keycloak.protect(),
  handlePaymentAccountList,
);
router.get(
  "/payment_account_list",
  keycloak.protect(),
  handlePaymentAccountList,
);
router.post(
  "/payment_account/create",
  keycloak.protect(),
  handlePaymentAccountCreate,
);
router.post(
  "/payment_account_create",
  keycloak.protect(),
  handlePaymentAccountCreate,
);
router.post(
  "/payment_account/edit",
  keycloak.protect(),
  handlePaymentAccountEdit,
);
router.post(
  "/payment_account_edit",
  keycloak.protect(),
  handlePaymentAccountEdit,
);
router.post(
  "/payment_account_detail",
  keycloak.protect(),
  handlePaymentAccountDetail,
);
router.get(
  "/payment_account_detail/:id",
  keycloak.protect(),
  handlePaymentAccountDetailGet,
);
router.post("/makePayment", keycloak.protect(), handleMakePayment);
router.post("/make_payment", keycloak.protect(), handleMakePayment);

router.get("/protected", keycloak.protect(), (req, res) => {
  res.json({ message: "Hello Protected World!" });
});

// --- PUBLIC ROUTES ---
router.post("/public/customer_list", (req, res) =>
  handleCustomerList(req, res, true),
);
router.post("/public/transactions_list", handleCustomerTransactionList);
router.post("/public/customer_detail", handleCustomerDetail);
router.get("/public/customer_detail/:id", handleCustomerDetailGet);
router.post("/public/profile_detail", handleProfileDetail);
router.get("/public/profile_detail", handleProfileDetail);
router.get("/public/profile_detail/:id", handleProfileDetailGet);
router.post("/public/customer_edit", handleCustomerEdit);
router.post("/public/customer_delete", handleCustomerDelete);
router.post("/public/customer_create", handleCustomerCreate);
router.post("/public/user_create", handleUserCreate);
router.post("/public/user_edit", handleUserEdit);
router.post("/public/user_delete", handleUserDelete);
router.post("/public/send_interest", handleSendInterest);
router.post("/public/interested_list", handleGetInterestedList);
router.get("/public/interested_list", handleGetInterestedList);
router.get("/public/subscription", handleSubscriptionGet);
router.get("/public/subscriptions", handleSubscriptionGet);
router.post("/public/subscription/create", handleSubscriptionCreate);
router.post("/public/subscription/edit", handleSubscriptionEdit);
router.get("/public/dashboard_analytics", handleDashboardAnalytics);
router.post("/public/dashboard_analytics", handleDashboardAnalytics);

router.post("/public/payment_account_list", handlePaymentAccountList);
router.get("/public/payment_account_list", handlePaymentAccountList);
router.post("/public/payment_account_create", handlePaymentAccountCreate);
router.post("/public/payment_account_edit", handlePaymentAccountEdit);
router.post("/public/payment_account_detail", handlePaymentAccountDetail);
router.get("/public/payment_account_detail/:id", handlePaymentAccountDetailGet);

router.post("/public/makePayment", handleMakePayment);
router.post("/public/make_payment", handleMakePayment);
router.post("/makePayment", handleMakePayment);

// --- OMNIWARE PAYMENT GATEWAY ROUTES ---
// 1. Browser 301 / 302 Redirection API
router.get("/payment/omniware/redirect", handleOmniwareRedirect);
router.post("/payment/omniware/redirect", handleOmniwareRedirect);
router.get("/public/payment/omniware/redirect", handleOmniwareRedirect);
router.post("/public/payment/omniware/redirect", handleOmniwareRedirect);

// 2. Initiate Payment Session (Returns JSON with payment execution URL)
router.post("/payment/omniware/initiate", handleOmniwareInitiate);
router.post("/public/payment/omniware/initiate", handleOmniwareInitiate);

// 3. Return URL Callback (Customer browser returns here via POST or GET from Omniware)
router.get("/payment/omniware/callback", handleOmniwareCallback);
router.post("/payment/omniware/callback", handleOmniwareCallback);
router.get("/public/payment/omniware/callback", handleOmniwareCallback);
router.post("/public/payment/omniware/callback", handleOmniwareCallback);

// 4. Server-to-Server Webhook
router.post("/payment/omniware/webhook", handleOmniwareWebhook);
router.post("/public/payment/omniware/webhook", handleOmniwareWebhook);

router.get("/public", (req, res) => {
  res.json({ message: "Hello Public World!" });
});

router.post("/send-email", handleSendEmail);

// --- VERIFICATION ROUTES ---
router.post("/verification/send-otp", keycloak.protect(), handleSendOTP);
router.post("/verification/verify-otp", keycloak.protect(), handleVerifyOTP);
router.post("/public/verification/send-otp", handleSendOTP);
router.post("/public/verification/verify-otp", handleVerifyOTP);

// --- FORGOT & RESET PASSWORD ROUTES ---
router.post("/public/forgot-password", handleForgotPassword);
router.post("/forgot-password", handleForgotPassword);
router.post("/public/reset-password", handleResetPassword);
router.post("/reset-password", handleResetPassword);

// --- MEDIA UPLOAD ROUTES ---
router.post("/media-upload", mediaUploadMiddleware, handleMediaUpload);
router.post("/media_upload", mediaUploadMiddleware, handleMediaUpload);
router.post("/public/media-upload", mediaUploadMiddleware, handleMediaUpload);
router.post("/public/media_upload", mediaUploadMiddleware, handleMediaUpload);

export default router;
