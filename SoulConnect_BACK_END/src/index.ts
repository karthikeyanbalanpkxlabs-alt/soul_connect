import express, { Request, Response } from "express";
import session from "express-session";
import cors from "cors";
import { keycloak, sessionStore } from "./keycloak-config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

import { Resend } from "resend";

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
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
  realmName: process.env.KEYCLOAK_REALM || "soul_connect",
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

const subscriptionSchema = new mongoose.Schema(
  {},
  { collection: "subscription", strict: false },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

// Seeding function from sample_customer.json if database is empty
const seedCustomers = async () => {
  try {
    const count = await Customers.countDocuments();
    if (count === 0) {
      console.log(
        "🌱 Customers collection is empty. Seeding from sample_customer.json...",
      );
      const pathsToTry = [
        path.join(__dirname, "sample_customer.json"),
        path.join(__dirname, "../src/sample_customer.json"),
        path.join(__dirname, "../sample_customer.json"),
        path.join(process.cwd(), "src/sample_customer.json"),
        path.join(process.cwd(), "sample_customer.json"),
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
        console.log(
          `✅ Successfully seeded ${processedData.length} customers!`,
        );
      } else {
        console.warn(
          "⚠️ Seed file sample_customer.json not found in search paths.",
        );
      }
    }
  } catch (err) {
    console.error("❌ Failed to seed customers:", err);
  }
};

mongoose
  .connect(MONGODB_URL, { dbName: "soul_connect_india" })
  .then(() => {
    console.log(
      "✅ Successfully connected to MongoDB Atlas (soul_connect_india)",
    );
    seedCustomers();
  })
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// -----------------------------------

// Helper handlers to be reused for both Keycloak-protected and public endpoints
async function handleCustomerList(req: Request, res: Response, type: any) {
  try {
    const filter = req.body.filter || {};
    const customer_type = req.body.customer_type || false;
    const limit = parseInt(req.body.limit) || 100;
    const skip = parseInt(req.body.skip) || 0;

    if (customer_type) {
      filter.public_verify = true;
    }

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
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch customer list" });
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
      return res.status(400).json({
        error:
          "Missing identifier (id, customer_id, email, or keycloakId) in request body",
      });
    }

    const customer = await Customers.findOne(query);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err: any) {
    console.error("customer_detail error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch customer detail" });
  }
}

function processUploadedImages(
  imagesInput: any[],
  req: Request,
): any[] | string {
  const savedImages = [];
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  for (let i = 0; i < imagesInput.length; i++) {
    const item = imagesInput[i];
    let imgStr = "";

    if (typeof item === "string") {
      imgStr = item;
    } else if (
      item &&
      typeof item === "object" &&
      typeof item.url === "string"
    ) {
      imgStr = item.url;
    } else {
      return `Invalid image item structure at index ${i}. Expected string or object with url property.`;
    }

    const isDefault =
      item && typeof item === "object" ? item.default === true : i === 0;

    // If it's already a hosted URL (does not start with data:), just preserve it
    if (
      imgStr.startsWith("http://") ||
      imgStr.startsWith("https://") ||
      (!imgStr.startsWith("data:") && imgStr.length < 200)
    ) {
      const imgObj: any = { url: imgStr };
      if (isDefault) {
        imgObj.default = true;
      }
      savedImages.push(imgObj);
      continue;
    }

    try {
      const matches = imgStr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let ext = "png";
      let data = imgStr;

      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        data = matches[2];
        const parts = mimeType.split("/");
        if (parts.length === 2) {
          ext = parts[1];
        }
      }

      const buffer = Buffer.from(data, "base64");
      const filename = `img_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);

      const host = req.get("host");
      const imageUrl = `${req.protocol}://${host}/uploads/${filename}`;
      const imgObj: any = { url: imageUrl };
      if (isDefault) {
        imgObj.default = true;
      }
      savedImages.push(imgObj);
    } catch (err: any) {
      return `Failed to process image ${i + 1}: ${err.message}`;
    }
  }

  return savedImages;
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
      return res.status(400).json({
        error:
          "Missing identifier (id, customer_id, email, or keycloakId) in request body",
      });
    }

    // Map camelCase fields to snake_case if present to align with database naming
    if (updateFields.firstName && !updateFields.first_name) {
      updateFields.first_name = updateFields.firstName;
    }
    if (updateFields.lastName && !updateFields.last_name) {
      updateFields.last_name = updateFields.lastName;
    }

    // Check if images are being updated
    const imagesInput = updateFields.image || updateFields.images;
    if (imagesInput !== undefined) {
      if (!Array.isArray(imagesInput)) {
        return res
          .status(400)
          .json({ error: "Invalid image upload. Expected array." });
      }
      if (imagesInput.length < 1 || imagesInput.length > 3) {
        return res.status(400).json({
          error:
            "Invalid image upload. Must upload minimum 1 and maximum 3 images.",
        });
      }
      const processed = processUploadedImages(imagesInput, req);
      if (typeof processed === "string") {
        return res.status(400).json({ error: processed });
      }
      updateFields.image = processed;
      if (updateFields.images) {
        delete updateFields.images;
      }
    }

    const customer = await Customers.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
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
      return res.status(400).json({
        error:
          "Missing identifier (id, customer_id, email, or keycloakId) in request body",
      });
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

async function handleCustomerCreate(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      first_name,
      last_name,
      email,
      image,
      images,
      role,
      ...otherFields
    } = req.body;

    const imagesInput = image || images;
    if (
      !imagesInput ||
      !Array.isArray(imagesInput) ||
      imagesInput.length < 1 ||
      imagesInput.length > 3
    ) {
      return res.status(400).json({
        error:
          "Invalid image upload. Must upload minimum 1 and maximum 3 images.",
      });
    }

    const processed = processUploadedImages(imagesInput, req);
    if (typeof processed === "string") {
      return res.status(400).json({ error: processed });
    }

    if (email) {
      const existing = await Customers.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ error: "Customer with this email already exists" });
      }
    }

    const first = firstName || first_name;
    const last = lastName || last_name;
    const customer_id =
      req.body.customer_id || `cid_${new mongoose.Types.ObjectId()}`;

    // Create Keycloak user
    let keycloakId = undefined;
    try {
      const kcAdmin = new KeycloakAdminClient({
        baseUrl: "http://localhost:4000",
        realmName: "master",
      });

      await kcAdmin.auth({
        username: "admin",
        password: "admin",
        grantType: "password",
        clientId: "admin-cli",
      });

      kcAdmin.setConfig({
        realmName: process.env.KEYCLOAK_REALM || "soul_connect",
      });

      const kcUser = await kcAdmin.users.create({
        username: first || email,
        email,
        firstName: first,
        lastName: last,
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: "password",
            value: "password@123",
            temporary: true,
          },
        ],
      });
      keycloakId = kcUser.id;
      console.log("✅ Inner Keycloak User created with ID:", keycloakId);

      if (role) {
        try {
          const groups = await kcAdmin.groups.find({ search: role });
          const targetGroup = groups.find((g: any) => g.name === role);
          if (targetGroup && targetGroup.id) {
            await kcAdmin.users.addToGroup({
              id: keycloakId,
              groupId: targetGroup.id,
            });
            console.log(`✅ Added Keycloak user to group: ${role}`);
          } else {
            console.log(`⚠️ Keycloak group not found: ${role}`);
          }
        } catch (groupErr: any) {
          console.error(
            `❌ Failed to assign group ${role} in Keycloak:`,
            groupErr.message || groupErr,
          );
        }

        try {
          const realmRole = await kcAdmin.roles.findOneByName({ name: role });
          if (realmRole && realmRole.id && realmRole.name) {
            await kcAdmin.users.addRealmRoleMappings({
              id: keycloakId,
              roles: [{ id: realmRole.id, name: realmRole.name }],
            });
            console.log(`✅ Assigned Keycloak realm role: ${role}`);
          } else {
            console.log(`⚠️ Keycloak realm role not found: ${role}`);
          }
        } catch (roleErr: any) {
          console.error(
            `❌ Failed to assign realm role ${role} in Keycloak:`,
            roleErr.message || roleErr,
          );
        }
      }
    } catch (kcErr: any) {
      console.error(
        "❌ Keycloak user creation failed:",
        kcErr.response?.data || kcErr.message,
      );
      return res.status(400).json({
        error: `Failed to create Keycloak user: ${kcErr.response?.data?.errorMessage || kcErr.message}`,
      });
    }

    const newCustomer = new Customers({
      customer_id,
      keycloakId,
      firstName: first,
      lastName: last,
      first_name: first,
      last_name: last,
      email,
      image: processed,
      role,
      ...otherFields,
    });

    await newCustomer.save();
    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: newCustomer,
    });
  } catch (err: any) {
    console.error("customer_create error:", err);
    res.status(500).json({ error: err.message || "Failed to create customer" });
  }
}

async function handleSubscriptionGet(req: Request, res: Response) {
  try {
    const subscriptions = await Subscription.find({});
    res.json(subscriptions);
  } catch (err: any) {
    console.error("subscription get error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch subscriptions" });
  }
}

// --- CUSTOMER APIs (With Keycloak Access / Protected) ---
app.post(
  "/api/customer_list",
  keycloak.protect(),
  (req: Request, res: Response) => handleCustomerList(req, res, "protected"),
);
app.post("/api/customer_detail", keycloak.protect(), handleCustomerDetail);
app.post("/api/customer_edit", keycloak.protect(), handleCustomerEdit);
app.post("/api/customer_delete", keycloak.protect(), handleCustomerDelete);
app.post("/api/customer_create", keycloak.protect(), handleCustomerCreate);
app.get("/api/subscription", keycloak.protect(), handleSubscriptionGet);
app.get("/api/subscriptions", keycloak.protect(), handleSubscriptionGet);

// --- CUSTOMER APIs (Without Keycloak Access / Public) ---
app.post("/api/public/customer_list", (req: Request, res: Response) =>
  handleCustomerList(req, res, "public"),
);
app.post("/api/public/customer_detail", handleCustomerDetail);
app.post("/api/public/customer_edit", handleCustomerEdit);
app.post("/api/public/customer_delete", handleCustomerDelete);
app.post("/api/public/customer_create", handleCustomerCreate);
app.get("/api/public/subscription", handleSubscriptionGet);
app.get("/api/public/subscriptions", handleSubscriptionGet);
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

const resend = new Resend(
  process.env.RESEND_API_KEY || "re_BTQAxNCr_DnGTK7KM7SAY4rpVq6aGorD2",
);
app.post("/api/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  console.log("resend mail loaded!!! sending to:", to);

  try {
    const { data, error } = await resend.emails.send({
      // from: process.env.RESEND_FROM || "onboarding@resend.dev",
      from: "karthikeyanbalan.pkxlabs@gmail.com",
      to: to,
      subject: subject || "Hello World",
      html: message
        ? `<h1>${message}</h1>`
        : `<p>Congrats on sending your <strong>first email</strong>!</p>`,
    });

    if (error) {
      console.error("Resend send error:", error);
      return res.status(400).json({
        success: false,
        error: error.message || error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data,
    });
  } catch (error: any) {
    console.error("Resend exception:", error);
    res.status(500).json({
      success: false,
      error: error?.message,
    });
  }
});

/* USER MODULE */

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
        baseUrl: "http://localhost:4000",
        realmName: "master", // Admin API auth usually goes through master
      });

      await kcAdminClient.auth({
        username: "admin",
        password: "admin",
        grantType: "password",
        clientId: "admin-cli",
      });

      kcAdminClient.setConfig({
        realmName: process.env.KEYCLOAK_REALM || "soul_connect", // Switch context to our specific realm
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
        realmName: process.env.KEYCLOAK_REALM || "soul_connect",
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

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
