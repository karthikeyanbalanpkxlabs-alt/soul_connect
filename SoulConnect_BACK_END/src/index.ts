import express, { Request, Response } from "express";
import session from "express-session";
import cors from "cors";
import { keycloak, sessionStore } from "./keycloak-config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
const nodemailer = require("nodemailer");
import { Resend } from "resend";
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

// GET /api/customer_list for frontend compatibility (protected by keycloak)
app.get(
  "/api/customer_list",
  keycloak.protect(),
  async (req: Request, res: Response) => {
    const token = (req as any).kauth?.grant?.access_token?.content;
    const keycloakId = token?.sub;

    if (!keycloakId) {
      console.warn("⚠️ GET /api/customer_list - No keycloakId found in token!");
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log(`📡 GET /api/customer_list requested.`);
    console.log(`🔑 Decoded Keycloak Token:`, JSON.stringify(token, null, 2));

    try {
      const email = token?.email;
      let customer = await Customers.findOne({ keycloakId });

      if (customer) {
        console.log(`✅ Customer found by keycloakId: ${keycloakId}`);
      } else {
        console.log(
          `🔍 Customer not found by keycloakId. Searching by email: [${email}]...`,
        );
        if (email) {
          customer = await Customers.findOne({ email });
          if (customer) {
            console.log(
              `✅ Customer found by email. Linking keycloakId: ${keycloakId}`,
            );
            await Customers.updateOne(
              { _id: customer._id },
              { $set: { keycloakId } },
            );
            customer.keycloakId = keycloakId;
          } else {
            console.log(
              `❌ Customer not found by email: [${email}] in database.`,
            );
            const dbEmails = await Customers.find({}, "email").limit(10);
            console.log(
              `📋 Existing customer emails in DB (up to 10):`,
              dbEmails.map((c) => c.email),
            );
          }
        } else {
          console.warn("⚠️ Token email field is undefined!");
        }
      }

      if (customer) {
        res.json(customer);
      } else {
        res.json(null);
      }
    } catch (err) {
      console.error("MongoDB Fetch Error:", err);
      res.status(500).json({ error: "Database error during fetch" });
    }
  },
);

// Helper handlers to be reused for both Keycloak-protected and public endpoints
async function handleCustomerList(req: Request, res: Response) {
  try {
    const filter = req.body.filter || {};
    const limit = parseInt(req.body.limit) || 100;
    const skip = parseInt(req.body.skip) || 0;

    const list = await Customers.find(filter).skip(skip).limit(limit);
    res.json(list);
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

function processUploadedImages(imagesInput: any[], req: Request): any[] | string {
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
    } else if (item && typeof item === "object" && typeof item.url === "string") {
      imgStr = item.url;
    } else {
      return `Invalid image item structure at index ${i}. Expected string or object with url property.`;
    }

    // If it's already a hosted URL (does not start with data:), just preserve it
    if (imgStr.startsWith("http://") || imgStr.startsWith("https://") || (!imgStr.startsWith("data:") && imgStr.length < 200)) {
      savedImages.push({
        url: imgStr,
        default: true,
      });
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
      savedImages.push({
        url: imageUrl,
        default: true,
      });
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
        return res.status(400).json({ error: "Invalid image upload. Expected array." });
      }
      if (imagesInput.length < 1 || imagesInput.length > 3) {
        return res.status(400).json({ error: "Invalid image upload. Must upload minimum 1 and maximum 3 images." });
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

    const newCustomer = new Customers({
      customer_id,
      firstName: first,
      lastName: last,
      first_name: first,
      last_name: last,
      email,
      image: processed,
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

// --- CUSTOMER APIs (With Keycloak Access / Protected) ---
app.post("/api/customer_list", keycloak.protect(), handleCustomerList);
app.post("/api/customer_detail", keycloak.protect(), handleCustomerDetail);
app.post("/api/customer_edit", keycloak.protect(), handleCustomerEdit);
app.post("/api/customer_delete", keycloak.protect(), handleCustomerDelete);
app.post("/api/customer_create", keycloak.protect(), handleCustomerCreate);

// --- CUSTOMER APIs (Without Keycloak Access / Public) ---
app.post("/api/public/customer_list", handleCustomerList);
app.post("/api/public/customer_detail", handleCustomerDetail);
app.post("/api/public/customer_edit", handleCustomerEdit);
app.post("/api/public/customer_delete", handleCustomerDelete);
app.post("/api/public/customer_create", handleCustomerCreate);
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

// console.log("USER:", process.env.GMAIL_USER);
// console.log("PASS:", process.env.GMAIL_PASS?.length);

// const transporter = nodemailer.createTransport({
//   // secure: true,
//   // host: 'smtp.gmail.com',
//   // port: 465,
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER || "karthikeyanbalan.pklabs@gmail.com",
//     pass: process.env.GMAIL_PASS || "qizzdwxyqgvdykrv",
//   },
// });

// transporter
//   .verify()
//   .then(() => console.log("Email Connected"))
//   .catch((err: any) => console.error("Email Connection error :", err?.message));

// app.post("/api/send-email-gmail", async (req, res) => {
//   const { to, subject, message } = req.body;

//   try {
//     console.log(to, subject, message);
//     await transporter.sendMail({
//       // from: process.env.GMAIL_USER || 'karthikeyanbalan.pklabs@gmail.com',
//       to,
//       subject,
//       html: `<h1>${message}</h1>`,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Email sent successfully",
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       error: error?.message,
//     });
//   }
// });

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

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
