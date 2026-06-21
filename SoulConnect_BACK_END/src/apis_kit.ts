import express, { Request, Response } from "express";
import session from "express-session";
import cors from "cors";
import { keycloak, sessionStore } from "./keycloak-config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
// import KcAdminClient from '@keycloak/keycloak-admin-client'
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "my-super-secret-session-key",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  }),
);

// --- KEYCLOAK ADMIN CLIENT SETUP ---
const kcAdminClient = new KeycloakAdminClient({
  baseUrl: process.env.KEYCLOAK_URL || "http://localhost:4000",
  realmName: process.env.KEYCLOAK_REALM || "sashti",
});

const connectAdminClient = async () => {
  const baseUrl = process.env.KEYCLOAK_URL || "http://localhost:4000";
  const realm = process.env.KEYCLOAK_REALM || "soul_connect";
  const clientId = process.env.KEYCLOAK_CLIENT_ID || "soul_connect_c";
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  console.log(
    `📡 Attempting Keycloak Admin Auth: [${baseUrl}] Realm: [${realm}] Client: [${clientId}]`,
  );

  if (!clientSecret) {
    console.error("❌ KEYCLOAK_CLIENT_SECRET is missing in .env!");
    return;
  }

  try {
    await kcAdminClient.auth({
      grantType: "client_credentials",
      clientId,
      clientSecret,
    });
    console.log("✅ Keycloak Admin Client Authenticated Successfully!");
  } catch (error: any) {
    console.error("❌ Keycloak Admin Client Authentication Failed:");
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error(
        "   Error:",
        error.response.data?.error || error.response.statusText,
      );
      console.error(
        "   Description:",
        error.response.data?.error_description || "No description provided",
      );
    } else {
      console.error("   Error Message:", error.message);
    }
  }
};

// Re-authenticate every 50 seconds to keep the admin session alive
setInterval(connectAdminClient, 50000);
connectAdminClient();
// ------------------------------------

app.use(keycloak.middleware());

// --- MONGODB CLUSTER INTEGRATION ---
const MONGODB_URL =
  "mongodb+srv://karthimailu_db_user:Rma1zgLmDktUJ3yD@soulconnectcluster.uszzhth.mongodb.net/soul_connect_india";
// const MONGODB_URL =
//   "mongodb+srv://admin:admin@simba-cluster.wv87zgs.mongodb.net/Simba_Sample";

const customerSchema = new mongoose.Schema(
  {
    keycloakId: { type: String, unique: true, sparse: true },
    firstName: String,
    lastName: String,
    first_name: String,
    last_name: String,
    email: String,
  },
  { collection: "customers", strict: false },
);

const Customers = mongoose.model("Customers", customerSchema);

// Seeding function from sample_customer.json if database is empty
const seedCustomers = async () => {
  try {
    const count = await Customers.countDocuments();
    if (count === 0) {
      console.log("🌱 Customers collection is empty. Seeding from sample_customer.json...");
      const pathsToTry = [
        path.join(__dirname, "sample_customer.json"),
        path.join(__dirname, "../src/sample_customer.json"),
        path.join(__dirname, "../sample_customer.json"),
        path.join(process.cwd(), "src/sample_customer.json"),
        path.join(process.cwd(), "sample_customer.json")
      ];
      let filePath = "";
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          filePath = p;
          break;
        }
      }
      if (filePath) {
        const rawData = fs.readFileSync(filePath, "utf-8");
        const sampleData = JSON.parse(rawData);
        const processedData = sampleData.map((cust: any) => {
          if (cust._id && cust._id.$oid) {
            cust._id = new mongoose.Types.ObjectId(cust._id.$oid);
          }
          return cust;
        });
        await Customers.insertMany(processedData);
        console.log(`✅ Successfully seeded ${processedData.length} customers!`);
      } else {
        console.warn("⚠️ Seed file sample_customer.json not found in search paths.");
      }
    }
  } catch (err) {
    console.error("❌ Failed to seed customers:", err);
  }
};

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas (soul_connect_india)");
    seedCustomers();
  })
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// Helper handlers to be reused for both Keycloak-protected and public endpoints
async function handleCustomerList(req: Request, res: Response) {
  try {
    const filter = req.body.filter || {};
    const limit = parseInt(req.body.limit) || 100;
    const skip = parseInt(req.body.skip) || 0;

    const total = await Customers.countDocuments(filter);
    const list = await Customers.find(filter).skip(skip).limit(limit);

    res.json({
      total,
      limit,
      skip,
      data: list,
    });
  } catch (err: any) {
    console.error("customer_list error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch customer list" });
  }
}

async function handleCustomerDetail(req: Request, res: Response) {
  try {
    const { id, customer_id, email, keycloakId } = req.body;
    let query: any = {};
    if (id) query._id = id;
    else if (customer_id) query.customer_id = customer_id;
    else if (email) query.email = email;
    else if (keycloakId) query.keycloakId = keycloakId;
    else {
      return res.status(400).json({ error: "Missing identifier (id, customer_id, email, or keycloakId) in request body" });
    }

    const customer = await Customers.findOne(query);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err: any) {
    console.error("customer_detail error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch customer detail" });
  }
}

async function handleCustomerEdit(req: Request, res: Response) {
  try {
    const { id, customer_id, email, keycloakId, ...updateFields } = req.body;
    let query: any = {};
    if (id) query._id = id;
    else if (customer_id) query.customer_id = customer_id;
    else if (email) query.email = email;
    else if (keycloakId) query.keycloakId = keycloakId;
    else {
      return res.status(400).json({ error: "Missing identifier (id, customer_id, email, or keycloakId) in request body" });
    }

    // Map camelCase fields to snake_case if present to align with database naming
    if (updateFields.firstName && !updateFields.first_name) {
      updateFields.first_name = updateFields.firstName;
    }
    if (updateFields.lastName && !updateFields.last_name) {
      updateFields.last_name = updateFields.lastName;
    }

    const customer = await Customers.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ success: true, message: "Customer updated successfully", customer });
  } catch (err: any) {
    console.error("customer_edit error:", err);
    res.status(500).json({ error: err.message || "Failed to update customer" });
  }
}

async function handleCustomerDelete(req: Request, res: Response) {
  try {
    const { id, customer_id, email, keycloakId } = req.body;
    let query: any = {};
    if (id) query._id = id;
    else if (customer_id) query.customer_id = customer_id;
    else if (email) query.email = email;
    else if (keycloakId) query.keycloakId = keycloakId;
    else {
      return res.status(400).json({ error: "Missing identifier (id, customer_id, email, or keycloakId) in request body" });
    }

    const customer = await Customers.findOneAndDelete(query);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err: any) {
    console.error("customer_delete error:", err);
    res.status(500).json({ error: err.message || "Failed to delete customer" });
  }
}

// POST endpoint to handle profile settings and updates via keycloak
app.post(
  "/api/profile_settings",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    const token = (req as any).kauth?.grant?.access_token?.content;
    const keycloakId = token?.sub;

    if (!keycloakId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { firstName, lastName, email } = req.body;

    try {
      const kcAdminClient = new KeycloakAdminClient({
        baseUrl: "http://127.0.0.1:4000",
        realmName: "master",
      });

      await kcAdminClient.auth({
        username: "admin",
        password: "admin",
        grantType: "password",
        clientId: "admin-cli",
      });

      kcAdminClient.setConfig({
        realmName: "soul_connect",
      });
      await kcAdminClient.users.update(
        { id: keycloakId as string },
        {
          firstName,
          lastName,
          email,
          enabled: true,
        },
      );

      // Find existing customer by keycloakId or email
      let customer = await Customers.findOne({
        $or: [
          { keycloakId },
          { email }
        ]
      });

      if (customer) {
        await Customers.updateOne(
          { _id: customer._id },
          {
            $set: {
              keycloakId,
              firstName,
              lastName,
              first_name: firstName,
              last_name: lastName,
              email
            }
          }
        );
      } else {
        const newCustomer = new Customers({
          keycloakId,
          firstName,
          lastName,
          first_name: firstName,
          last_name: lastName,
          email
        });
        await newCustomer.save();
      }

      res.json({
        success: true,
        message: "Profile settings saved successfully.",
      });
    } catch (err) {
      console.error("MongoDB Save Error:", err);
      res.status(500).json({ error: "Database error during save" });
    }
  },
);

// --- CUSTOMER APIs (With Keycloak Access / Protected) ---
app.post("/api/customer_list", keycloak.protect(), handleCustomerList);
app.post("/api/customer_detail", keycloak.protect(), handleCustomerDetail);
app.post("/api/customer_edit", keycloak.protect(), handleCustomerEdit);
app.post("/api/customer_delete", keycloak.protect(), handleCustomerDelete);

// --- CUSTOMER APIs (Without Keycloak Access / Public) ---
app.post("/api/public/customer_list", handleCustomerList);
app.post("/api/public/customer_detail", handleCustomerDetail);
app.post("/api/public/customer_edit", handleCustomerEdit);
app.post("/api/public/customer_delete", handleCustomerDelete);

// --- DASHBOARD MONGODB INTEGRATION ---
const defaultDashboardStub = {
  topCards: {
    income: { amount: "$45,000", change: "6%", changeType: "positive" },
    expense: { amount: "$27,450", change: "2%", changeType: "negative" },
    savings: { amount: "$17,550", change: "1%", changeType: "negative" },
    mostSpending: { item: "House Rent", amount: "$1150" },
  },
  expenseSources: [
    { name: "Repairs", value: 3100 },
    { name: "House Rent", value: 3519 },
    { name: "Licenses", value: 2900 },
    { name: "Transport", value: 1550 },
    { name: "Laptop", value: 2400 },
    { name: "Net Bill", value: 2850 },
    { name: "AC", value: 1800 },
    { name: "Dish Bill", value: 1100 },
    { name: "School", value: 2350 },
    { name: "Plants", value: 1450 },
  ],
  recentExpenses: [
    { item: "Fridge", date: "1st January, 2023", amount: "$550" },
    { item: "Internet Bill", date: "28th December, 2022", amount: "$17" },
    { item: "Indoor Plants", date: "27th December, 2022", amount: "$96" },
    { item: "Transport", date: "25th December, 2022", amount: "$11" },
  ],
  reportOverview: [
    { name: "Expense", value: 65, color: "#34d399" },
    { name: "Income", value: 25, color: "#059669" },
    { name: "Savings", value: 10, color: "#0f172a" },
  ],
  expenseActivity: [
    { date: "Jan 1", actual: 1600 },
    { date: "Jan 2", actual: 1800 },
    { date: "Jan 3", actual: 1950 },
    { date: "Jan 4", actual: 1550 },
    { date: "Jan 5", actual: 1850 },
    { date: "Jan 6", actual: 2050 },
    { date: "Jan 7", actual: 1200 },
    { date: "Jan 8", actual: 1400 },
    { date: "Jan 9", actual: 2357 },
    { date: "Jan 10", actual: 1900 },
    { date: "Jan 11", actual: 2100 },
  ],
};

const dashboardDataSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    topCards: mongoose.Schema.Types.Mixed,
    expenseSources: mongoose.Schema.Types.Mixed,
    recentExpenses: mongoose.Schema.Types.Mixed,
    reportOverview: mongoose.Schema.Types.Mixed,
    expenseActivity: mongoose.Schema.Types.Mixed,
  },
  { collection: "dashboard_data" },
);

const DashboardData = mongoose.model("DashboardData", dashboardDataSchema);

app.get(
  "/api/dashboard_info",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    const token = (req as any).kauth?.grant?.access_token?.content;
    const userId = token?.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      let dashData = await DashboardData.findOne({ userId });

      // Auto-seed default dashboard data if a user clicks Dashboard for the first time
      if (!dashData) {
        dashData = new DashboardData({ userId, ...defaultDashboardStub });
        await dashData.save();
      }

      res.json(dashData);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      res.status(500).json({ error: "Database error during dashboard fetch" });
    }
  },
);
// ----------------------------

// --- USER INFO CRUD API ---
const userInfoSchema = new mongoose.Schema(
  {
    keycloakId: { type: String, unique: true }, // Linking to Keycloak ID
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "User" },
    status: { type: String, default: "Active" },
  },
  { collection: "user_info", timestamps: true },
);

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

app.get(
  "/api/users",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    try {
      const users = await UserInfo.find({}).sort({ createdAt: -1 });
      res.json(users);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },
);

app.post(
  "/api/users",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, role, status } = req.body;
    console.log("🚀 Attempting to create user:", email);
    try {
      const kcAdminClient = new KeycloakAdminClient({
        baseUrl: "http://127.0.0.1:4000",
        realmName: "master", // Admin API auth usually goes through master
      });

      await kcAdminClient.auth({
        username: "admin",
        password: "admin",
        grantType: "password",
        clientId: "admin-cli",
      });

      kcAdminClient.setConfig({
        realmName: "sashti", // Switch context to our specific realm
      });

      // 1. Create User in Keycloak

      const kcUser = await kcAdminClient.users.create({
        username: firstName,
        email,
        firstName,
        lastName,
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: "password",
            value: "password@123",
            temporary: false,
          },
        ],
      });

      // const kcUser = await kcAdminClient.users.create({
      //   username: email,
      //   email,
      //   firstName,
      //   lastName,
      //   enabled: status === "Active",
      //   emailVerified: true,
      // });

      const keycloakId = kcUser.id;
      console.log("✅ User created in Keycloak, ID:", keycloakId);

      // 2. Map role in Keycloak (Optional, can be expanded to Keycloak roles)

      // 3. Save User in MongoDB linked by Keycloak ID
      const newUser = new UserInfo({
        keycloakId,
        firstName,
        lastName,
        email,
        role,
        status,
      });
      await newUser.save();
      console.log("✅ User saved in MongoDB");

      res.json(newUser);
    } catch (err: any) {
      console.error("❌ Create User Error Detaiils:");
      if (err.response) {
        console.error("Keycloak Status Code:", err.response.status);
        console.error("Keycloak Error Message:", err.response.data);
      } else {
        console.error("Error Message:", err.message);
        console.error("Stack Trace:", err.stack);
      }

      const message =
        err.response?.data?.errorMessage ||
        err.message ||
        "Failed to create user";
      res.status(500).json({ error: message });
    }
  },
);

app.put(
  "/api/users/:id",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, role, status } = req.body;

    try {
      // 1. Get user from MongoDB
      const user = await UserInfo.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found in DB" });
      }

      // 2. Initialize Keycloak Admin Client
      const kcAdminClient = new KeycloakAdminClient({
        baseUrl: "http://127.0.0.1:4000",
        realmName: "master",
      });

      await kcAdminClient.auth({
        username: "admin",
        password: "admin",
        grantType: "password",
        clientId: "admin-cli",
      });

      kcAdminClient.setConfig({
        realmName: "sashti",
      });

      // 3. Ensure we have Keycloak ID
      let keycloakId = user.keycloakId;

      if (!keycloakId) {
        const kcUsers = await kcAdminClient.users.find({ email });

        if (!kcUsers.length) {
          return res.status(404).json({ error: "User not found in Keycloak" });
        }

        keycloakId = kcUsers[0].id;

        // Save it for future use
        user.keycloakId = keycloakId;
        await user.save();
      }

      // 4. Update user in Keycloak
      await kcAdminClient.users.update(
        { id: keycloakId as string },
        {
          firstName,
          lastName,
          email,
          enabled: status === "Active",
        },
      );

      // 5. Update user in MongoDB
      const updatedUser = await UserInfo.findByIdAndUpdate(
        req.params.id,
        { firstName, lastName, email, role, status },
        { new: true },
      );

      return res.json(updatedUser);
    } catch (err: any) {
      console.error("Update User Error:", err.response?.data || err.message);

      return res.status(err.response?.status || 500).json({
        error: err.response?.data || "Failed to update user",
      });
    }
  },
);

// app.put(
//   "/api/users/:id",
//   keycloak.protect(),
//   async (req: Request, res: Response) => {
//     const { firstName, lastName, email, role, status } = req.body;
//     try {
//       const user = await UserInfo.findById(req.params.id);
//       if (!user) return res.status(404).json({ error: "User not found" });

//       // 1. Update User in Keycloak
//       console.log("TRACE MOVED 1", user.keycloakId);
//       if (user.keycloakId) {
//         console.log("TRACE MOVED 2");
//         const kcAdminClient = new KeycloakAdminClient({
//           baseUrl: "http://127.0.0.1:4000",
//           realmName: "master", // Admin API auth usually goes through master
//         });

//         await kcAdminClient.auth({
//           username: "admin",
//           password: "admin",
//           grantType: "password",
//           clientId: "admin-cli",
//         });

//         kcAdminClient.setConfig({
//           realmName: "sashti", // Switch context to our specific realm
//         });

//         console.log("TRACE MOVED 3");
//         // 1. Create User in Keycloak

//         await kcAdminClient.users.update(
//           { id: user.keycloakId },
//           {
//             firstName,
//             lastName,
//             email,
//             // enabled: status === "Active",
//             enabled: true,
//           },
//         );
//       }

//       // 2. Update User in MongoDB
//       const updatedUser = await UserInfo.findByIdAndUpdate(
//         req.params.id,
//         { firstName, lastName, email, role, status },
//         { new: true },
//       );
//       res.json(updatedUser);
//     } catch (err: any) {
//       console.error("Update User Error:", err);
//       res.status(500).json({ error: "Failed to update user" });
//     }
//   },
// );

app.delete(
  "/api/users/:id",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    try {
      const user = await UserInfo.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      // 1. Delete User from Keycloak
      if (user.keycloakId) {
        await kcAdminClient.users.del({ id: user.keycloakId });
      }

      // 2. Delete User from MongoDB
      await UserInfo.findByIdAndDelete(req.params.id);
      res.json({
        success: true,
        message: "User deleted successfully from Keycloak and DB",
      });
    } catch (err: any) {
      console.error("Delete User Error:", err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
);

// --- PRODUCT MANAGEMENT CRUD API ---
const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    barcode: { type: String },
    skuId: { type: String, unique: true, sparse: true },
    type: { type: String, default: "packages" },
    description: { type: String },
    weightOrLiter: { type: String },
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
    defaultImage: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { collection: "products", timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

app.get(
  "/api/products",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 });
      res.json(products);
    } catch (err) {
      console.error("Fetch Products Error:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  },
);

app.post(
  "/api/products",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    try {
      const token = (req as any).kauth?.grant?.access_token?.content;
      const username = token?.preferred_username || token?.email || "System";

      const productData = {
        ...req.body,
        createdBy: username,
        updatedBy: username,
      };

      if (
        !productData.defaultImage &&
        productData.images &&
        productData.images.length > 0
      ) {
        productData.defaultImage = productData.images[0];
      }

      const newProduct = new Product(productData);
      await newProduct.save();
      res.json(newProduct);
    } catch (err: any) {
      console.error("Create Product Error:", err);
      res
        .status(500)
        .json({ error: err.message || "Failed to create product" });
    }
  },
);

app.put(
  "/api/products/:id",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    try {
      const token = (req as any).kauth?.grant?.access_token?.content;
      const username = token?.preferred_username || token?.email || "System";

      const updateData = {
        ...req.body,
        updatedBy: username,
      };

      if (
        !updateData.defaultImage &&
        updateData.images &&
        updateData.images.length > 0
      ) {
        updateData.defaultImage = updateData.images[0];
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true },
      );
      if (!updatedProduct)
        return res.status(404).json({ error: "Product not found" });
      res.json(updatedProduct);
    } catch (err: any) {
      console.error("Update Product Error:", err);
      res
        .status(500)
        .json({ error: err.message || "Failed to update product" });
    }
  },
);

app.delete(
  "/api/products/:id",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      console.error("Delete Product Error:", err);
      res.status(500).json({ error: "Failed to delete product" });
    }
  },
);
// ----------------------------

app.get("/api/public", (req: Request, res: Response) => {
  res.json({
    message: "This is a public endpoint. No authentication required.",
  });
});

app.get("/api/protected", keycloak.protect(), (req: Request, res: Response) => {
  res.json({
    message: "This is a protected endpoint. You are authenticated!",
    user: (req as any).kauth?.grant?.access_token?.content,
  });
});

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
