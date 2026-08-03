import { Router } from "express";
import { keycloak } from "../keycloak-config";
import {
  handleCustomerList,
  handleCustomerDetail,
  handleCustomerDetailGet,
  handleProfileDetail,
  handleProfileDetailGet,
  handleCustomerEdit,
  handleCustomerDelete,
  handleCustomerCreate,
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
} from "../controllers/userController";
import { handleSendEmail } from "../controllers/emailController";
import {
  handleSendOTP,
  handleVerifyOTP,
} from "../controllers/verificationController";

const router = Router();

// --- PROTECTED ROUTES ---

router.post("/transactions_list", keycloak.protect(), (req, res) =>
  handleCustomerList(req, res, false),
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

router.get("/protected", keycloak.protect(), (req, res) => {
  res.json({ message: "Hello Protected World!" });
});

// --- PUBLIC ROUTES ---
router.post("/public/customer_list", (req, res) =>
  handleCustomerList(req, res, true),
);
router.post("/public/customer_detail", handleCustomerDetail);
router.get("/public/customer_detail/:id", handleCustomerDetailGet);
router.post("/public/profile_detail", handleProfileDetail);
router.get("/public/profile_detail", handleProfileDetail);
router.get("/public/profile_detail/:id", handleProfileDetailGet);
router.post("/public/customer_edit", handleCustomerEdit);
router.post("/public/customer_delete", handleCustomerDelete);
router.post("/public/customer_create", handleCustomerCreate);
router.get("/public/subscription", handleSubscriptionGet);
router.get("/public/subscriptions", handleSubscriptionGet);
router.post("/public/subscription/create", handleSubscriptionCreate);
router.post("/public/subscription/edit", handleSubscriptionEdit);
router.get("/public/dashboard_analytics", handleDashboardAnalytics);
router.post("/public/dashboard_analytics", handleDashboardAnalytics);

router.get("/public", (req, res) => {
  res.json({ message: "Hello Public World!" });
});

router.post("/send-email", handleSendEmail);

// --- VERIFICATION ROUTES ---
router.post("/verification/send-otp", keycloak.protect(), handleSendOTP);
router.post("/verification/verify-otp", keycloak.protect(), handleVerifyOTP);
router.post("/public/verification/send-otp", handleSendOTP);
router.post("/public/verification/verify-otp", handleVerifyOTP);

export default router;
