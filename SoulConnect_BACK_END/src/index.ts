import express, { Request, Response } from "express";
import session from "express-session";
import cors from "cors";
import { keycloak, sessionStore } from "./keycloak-config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
dotenv.config();

let GLOBAL_DETAILS = {
  // username: "admin",
  // password: "admin",
  username: "admin_soulconnect",
  password: "Welcome@123",
};

let EMAIL_TRIGGER_ENABLE_FLAG = true;
const app = express();
app.disable("etag");
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://dev.soulconect.com",
      "https://soulconect.com",
    ], // Frontend URL
    credentials: true,
  }),
);

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
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
    `📡 Attempting Test 2 Keycloak Admin Auth: [${baseUrl}] Realm: [${realm}] Client: [${clientId}]`,
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
    createdAtTime: Date,
    modifiedAtTime: Date,
    modifiedByemail: String,
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

    // Exclude the logged-in user's own profile from the list if authenticated
    const tokenContent = (req as any).kauth?.grant?.access_token?.content;
    const loggedInKeycloakId = tokenContent?.sub;
    const loggedInEmail = tokenContent?.email;

    if (loggedInKeycloakId) {
      filter.keycloakId = { $ne: loggedInKeycloakId };
    }
    if (loggedInEmail) {
      filter.email = { $ne: loggedInEmail };
    }

    if (customer_type) {
      filter.public_verify = true;
    }

    const reqFilters = req.body.filters || {};
    for (const key of Object.keys(reqFilters)) {
      const val = reqFilters[key];
      if (val !== undefined && val !== null && val !== "") {
        let dbKey = key;
        if (key === "firstName") dbKey = "first_name";
        if (key === "lastName") dbKey = "last_name";
        if (key === "approvalStatus" || key === "public_verify") {
          const lowerVal = String(val).toLowerCase();
          if ("approved".includes(lowerVal) || lowerVal === "true") {
            filter.public_verify = true;
          } else if (
            "wait for approval".includes(lowerVal) ||
            lowerVal === "false" ||
            lowerVal === "rejected"
          ) {
            filter.public_verify = false;
          } else {
            // Unmatchable condition if user types something random
            filter.public_verify = null;
          }
        } else {
          filter[dbKey] = { $regex: val, $options: "i" };
        }
      }
    }

    let sortOption: any = { _id: -1 };
    if (req.body.sort) {
      if (typeof req.body.sort === "object") {
        sortOption = req.body.sort;
      } else if (typeof req.body.sort === "string") {
        if (req.body.sort.toLowerCase() === "asc") {
          sortOption = { _id: 1 };
        } else if (req.body.sort.toLowerCase() === "desc") {
          sortOption = { _id: -1 };
        } else {
          const direction = req.body.order === "asc" ? 1 : -1;
          sortOption = { [req.body.sort]: direction };
        }
      }
    } else if (req.body.order) {
      if (req.body.order.toLowerCase() === "asc") {
        sortOption = { _id: 1 };
      } else {
        sortOption = { _id: -1 };
      }
    }

    const total = await Customers.countDocuments(filter);
    const list = await Customers.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

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

async function handleCustomerDetailGet(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ error: "Missing identifier in request URL" });
    }

    const customer = await Customers.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err: any) {
    console.error("customer_detail_get error:", err);
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
      let ext = "png";
      let data = imgStr;

      if (imgStr.startsWith("data:")) {
        const commaIdx = imgStr.indexOf(",");
        if (commaIdx !== -1) {
          data = imgStr.substring(commaIdx + 1);
          const mimeStr = imgStr.substring(5, commaIdx);
          const mimeParts = mimeStr.split(";")[0].split("/");
          if (mimeParts.length === 2) {
            ext = mimeParts[1];
          }
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

function processUploadedVideo(
  videoInput: any,
  req: Request,
): { url: string } | string {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let vidStr = "";

  if (typeof videoInput === "string") {
    vidStr = videoInput;
  } else if (
    videoInput &&
    typeof videoInput === "object" &&
    typeof videoInput.url === "string"
  ) {
    vidStr = videoInput.url;
  } else {
    return "Invalid video item structure. Expected string or object with url property.";
  }

  // If it's already a hosted URL (does not start with data:), just preserve it
  if (
    vidStr.startsWith("http://") ||
    vidStr.startsWith("https://") ||
    (!vidStr.startsWith("data:") && vidStr.length < 200)
  ) {
    return { url: vidStr };
  }

  try {
    let ext = "mp4";
    let data = vidStr;

    if (vidStr.startsWith("data:")) {
      const commaIdx = vidStr.indexOf(",");
      if (commaIdx !== -1) {
        data = vidStr.substring(commaIdx + 1);
        const mimeStr = vidStr.substring(5, commaIdx);
        const mimeParts = mimeStr.split(";")[0].split("/");
        if (mimeParts.length === 2) {
          ext = mimeParts[1];
        }
      }
    }

    const buffer = Buffer.from(data, "base64");
    const filename = `vid_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const host = req.get("host");
    const videoUrl = `${req.protocol}://${host}/uploads/${filename}`;
    return { url: videoUrl };
  } catch (err: any) {
    return `Failed to process video: ${err.message}`;
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
      if (imagesInput.length < 1 || imagesInput.length > 5) {
        return res.status(400).json({
          error:
            "Invalid image upload. Must upload minimum 1 and maximum 5 images.",
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

    // Check if video is being updated
    const videoInput = updateFields.video;
    if (videoInput !== undefined) {
      if (videoInput === null || videoInput === "") {
        updateFields.video = null;
      } else {
        const processed = processUploadedVideo(videoInput, req);
        if (typeof processed === "string") {
          return res.status(400).json({ error: processed });
        }
        updateFields.video = processed;
      }
    }

    const tokenContent = (req as any).kauth?.grant?.access_token?.content;
    const loggedInEmail = tokenContent?.email;

    updateFields.modifiedAtTime = new Date();
    if (loggedInEmail) {
      updateFields.modifiedByemail = loggedInEmail;
    } else if (email) {
      updateFields.modifiedByemail = email;
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
      video,
      role,
      ...otherFields
    } = req.body;

    const imagesInput = image || images;
    if (
      !imagesInput ||
      !Array.isArray(imagesInput) ||
      imagesInput.length < 1 ||
      imagesInput.length > 5
    ) {
      return res.status(400).json({
        error:
          "Invalid image upload. Must upload minimum 1 and maximum 5 images.",
      });
    }

    const processed = processUploadedImages(imagesInput, req);
    if (typeof processed === "string") {
      return res.status(400).json({ error: processed });
    }

    let processedVideo = undefined;
    if (video !== undefined && video !== null && video !== "") {
      const processedVid = processUploadedVideo(video, req);
      if (typeof processedVid === "string") {
        return res.status(400).json({ error: processedVid });
      }
      processedVideo = processedVid;
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
        baseUrl: process.env.KEYCLOAK_URL || "http://localhost:4000",
        realmName: "master",
      });

      await kcAdmin.auth({
        ...GLOBAL_DETAILS,
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
      console.error("❌ Keycloak user creation failed:", JSON.stringify(kcErr));
      return res.status(400).json({
        error: `Failed to create Keycloak user: ${kcErr.response?.data?.errorMessage || kcErr.message}`,
      });
    }

    const tokenContent = (req as any).kauth?.grant?.access_token?.content;
    const loggedInEmail = tokenContent?.email;

    const newCustomer = new Customers({
      customer_id,
      keycloakId,
      firstName: first,
      lastName: last,
      first_name: first,
      last_name: last,
      email,
      image: processed,
      video: processedVideo,
      role,
      createdAtTime: new Date(),
      modifiedAtTime: new Date(),
      modifiedByemail: loggedInEmail || email || undefined,
      ...otherFields,
    });

    await newCustomer.save();

    // Trigger /api/send-email with the complete customer creation response details
    if (EMAIL_TRIGGER_ENABLE_FLAG) {
      try {
        if (email) {
          const protocol = req.secure ? "https" : "http";
          const host = req.headers.host || `localhost:${PORT}`;

          // Share complete customer response in the email body
          const emailHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Welcome to Soul Connect</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #F6F6F9;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    table {
      border-collapse: collapse;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F6F9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F6F6F9; padding: 20px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header Area -->
          <tr>
            <td style="background: linear-gradient(135deg, #F2688C 0%, #7C3AED 100%); padding: 32px 24px; text-align: left; vertical-align: middle;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Header Logo & Title -->
                  <td style="vertical-align: middle;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #ffffff; padding-right: 12px; vertical-align: middle;">
                          <svg width="40" height="40" viewBox="0 0 100 100" style="display: block;">
                            <circle cx="36" cy="35" r="7" fill="#ffffff" />
                            <circle cx="64" cy="35" r="7" fill="#ffffff" />
                            <path d="M50 78 C35 68, 22 50, 22 39 C22 30, 29 25, 36 25 C42 25, 47 29, 50 33 C53 29, 58 25, 64 25 C71 25, 78 30, 78 39 C78 50, 65 68, 50 78 Z" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M36 50 C42 55, 48 55, 50 53 C52 55, 58 55, 64 50" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
                          </svg>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 24px; font-weight: 800; font-family: sans-serif; display: block; letter-spacing: 0.5px;">Soul Connect</span>
                          <span style="color: #fce7f3; font-size: 11px; font-weight: 500; font-family: sans-serif; display: block; opacity: 0.9; margin-top: 2px;">Connecting Hearts, Building Relationships</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  
                  <!-- Welcome Envelope Illustration -->
                  <td width="150" align="right" style="vertical-align: middle;">
                    <svg width="130" height="110" viewBox="0 0 150 130" fill="none" style="display: block;">
                      <path d="M20 90 L130 90 L120 120 L30 120 Z" fill="#6d28d9" opacity="0.15" />
                      <rect x="25" y="55" width="100" height="65" rx="6" fill="#a78bfa" />
                      <rect x="35" y="25" width="80" height="60" rx="4" fill="#ffffff" stroke="#e9d5ff" stroke-width="2" />
                      <path d="M75 48 C75 48 70 43 66 43 C62 43 59 46 59 50 C59 56 75 66 75 66 C75 66 91 56 91 50 C91 46 88 43 84 43 C80 43 75 48 75 48 Z" fill="#F2688C" />
                      <text x="75" y="70" fill="#7C3AED" font-family="cursive, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Welcome!</text>
                      <path d="M25 55 L75 90 L25 120 Z" fill="#8b5cf6" />
                      <path d="M125 55 L75 90 L125 120 Z" fill="#8b5cf6" />
                      <path d="M25 120 L75 85 L125 120 Z" fill="#7c3aed" />
                      <path d="M25 55 L75 25 L125 55 Z" fill="#c084fc" opacity="0.8" />
                      <path d="M130 35 L138 31" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" />
                      <path d="M132 45 L142 45" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" />
                      <path d="M128 25 L132 17" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 40px 32px 32px 32px; background-color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                
                <!-- Greeting Header -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Waving Hand Icon -->
                        <td style="padding-right: 16px; vertical-align: middle;">
                          <div style="background-color: #f3f0ff; width: 44px; height: 44px; border-radius: 50%; text-align: center; line-height: 44px; font-size: 22px;">👋</div>
                        </td>
                        <td style="vertical-align: middle;">
                          <h1 style="margin: 0; color: #0F0A1E; font-size: 24px; font-weight: 800; font-family: sans-serif;">
                            Hello, <span style="color: #7C3AED;">${first || "User"}</span>!
                          </h1>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Intro Paragraph -->
                <tr>
                  <td style="color: #4B4468; font-size: 15px; line-height: 1.6; padding-bottom: 28px; font-family: sans-serif;">
                    Your Soul Connect account has been successfully created. We're excited to have you join our community!
                  </td>
                </tr>
                
                <!-- Account Details Card -->
                <tr>
                  <td style="background-color: #faf9ff; border: 1px solid #ede9fe; border-radius: 16px; padding: 24px; margin-bottom: 28px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      
                      <!-- Card Title -->
                      <tr>
                        <td style="padding-bottom: 20px;">
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="color: #7C3AED; padding-right: 8px; vertical-align: middle;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              </td>
                              <td style="vertical-align: middle;">
                                <span style="color: #7C3AED; font-weight: 700; font-size: 16px; font-family: sans-serif;">Your Account Details</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Username Row -->
                      <tr>
                        <td style="padding: 12px 0; border-top: 1px dashed #e8e3ff;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="36" style="vertical-align: middle;">
                                <div style="background-color: #ede9fe; width: 28px; height: 28px; border-radius: 8px; text-align: center; line-height: 28px; color: #7C3AED;">
                                  👤
                                </div>
                              </td>
                              <td width="150" style="color: #4B4468; font-weight: 600; font-size: 14px; font-family: sans-serif; vertical-align: middle;">Username</td>
                              <td style="color: #0F0A1E; font-size: 14px; font-family: monospace; font-weight: bold; word-break: break-all; vertical-align: middle;">${first || email}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Email Address Row -->
                      <tr>
                        <td style="padding: 12px 0; border-top: 1px dashed #e8e3ff;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="36" style="vertical-align: middle;">
                                <div style="background-color: #ede9fe; width: 28px; height: 28px; border-radius: 8px; text-align: center; line-height: 28px; color: #7C3AED;">
                                  ✉️
                                </div>
                              </td>
                              <td width="150" style="color: #4B4468; font-weight: 600; font-size: 14px; font-family: sans-serif; vertical-align: middle;">Email Address</td>
                              <td style="color: #3b82f6; font-size: 14px; font-family: sans-serif; word-break: break-all; vertical-align: middle;">${email}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Temporary Password Row -->
                      <tr>
                        <td style="padding: 12px 0; border-top: 1px dashed #e8e3ff; padding-bottom: 20px;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="36" style="vertical-align: middle;">
                                <div style="background-color: #ede9fe; width: 28px; height: 28px; border-radius: 8px; text-align: center; line-height: 28px; color: #7C3AED;">
                                  🔑
                                </div>
                              </td>
                              <td width="150" style="color: #4B4468; font-weight: 600; font-size: 14px; font-family: sans-serif; vertical-align: middle;">Temporary Password</td>
                              <td style="color: #0F0A1E; font-size: 14px; font-family: monospace; font-weight: bold; vertical-align: middle;">password@123</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Security Note Callout Box -->
                      <tr>
                        <td style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px 16px;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="28" style="vertical-align: top; padding-top: 2px;">
                                🛡️
                              </td>
                              <td style="color: #b45309; font-size: 13px; line-height: 1.5; font-family: sans-serif;">
                                For your security, please change your password after your first login.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
                
                <!-- Spacer -->
                <tr>
                  <td style="height: 32px;"></td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td align="center">
                    <a href="http://localhost:5174" target="_blank" style="background-color: #7C3AED; color: #ffffff; padding: 16px 36px; border-radius: 100px; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(124,58,237,0.25); font-family: sans-serif;">
                      Login to Soul Connect &nbsp;→
                    </a>
                  </td>
                </tr>
                
                <!-- Spacer -->
                <tr>
                  <td style="height: 32px;"></td>
                </tr>
                
                <!-- Info text below button -->
                <tr>
                  <td align="center" style="color: #8B85A0; font-size: 13px; line-height: 1.5; font-family: sans-serif; padding: 0 10px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 8px;">✅</td>
                        <td style="color: #8B85A0; text-align: left;">If you did not request this account, please ignore this email or contact our support team immediately.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- Footer Area -->
          <tr>
            <td style="background-color: #fbfbfa; padding: 36px 32px 32px 32px; border-top: 1px solid #f0f0f0; text-align: center;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                
                <!-- Footer Logo -->
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #7C3AED; padding-right: 8px; vertical-align: middle;">
                          <svg width="32" height="32" viewBox="0 0 100 100" style="display: block;">
                            <circle cx="36" cy="35" r="7" fill="#7C3AED" />
                            <circle cx="64" cy="35" r="7" fill="#7C3AED" />
                            <path d="M50 78 C35 68, 22 50, 22 39 C22 30, 29 25, 36 25 C42 25, 47 29, 50 33 C53 29, 58 25, 64 25 C71 25, 78 30, 78 39 C78 50, 65 68, 50 78 Z" fill="none" stroke="#7C3AED" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M36 50 C42 55, 48 55, 50 53 C52 55, 58 55, 64 50" fill="none" stroke="#7C3AED" stroke-width="5" stroke-linecap="round" />
                          </svg>
                        </td>
                        <td style="vertical-align: middle; color: #0F0A1E; font-size: 18px; font-weight: 800; font-family: sans-serif;">
                          Soul Connect
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Social Media Icons -->
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 0 8px;"><a href="#" style="text-decoration: none; color: #7C3AED; font-weight: bold; font-size: 20px;">🔵</a></td>
                        <td style="padding: 0 8px;"><a href="#" style="text-decoration: none; color: #7C3AED; font-weight: bold; font-size: 20px;">📸</a></td>
                        <td style="padding: 0 8px;"><a href="#" style="text-decoration: none; color: #7C3AED; font-weight: bold; font-size: 20px;">🐦</a></td>
                        <td style="padding: 0 8px;"><a href="#" style="text-decoration: none; color: #7C3AED; font-weight: bold; font-size: 20px;">💼</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Copyright & Support links -->
                <tr>
                  <td style="color: #8B85A0; font-size: 12px; font-family: sans-serif; line-height: 1.8;">
                    © ${new Date().getFullYear()} Soul Connect. All rights reserved.<br/>
                    <a href="mailto:support@soulconnect.com" style="color: #7C3AED; text-decoration: none; font-weight: 600;">support@soulconnect.com</a> &nbsp;|&nbsp; <a href="http://www.soulconnect.com" target="_blank" style="color: #7C3AED; text-decoration: none; font-weight: 600;">www.soulconnect.com</a>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

          console.log(`Triggering /api/send-email for ${email}...`);

          await fetch(`${protocol}://${host}/api/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: email,
              subject: "Welcome to Soul Connect - Account Created",
              message: emailHtml,
            }),
          });
        }
      } catch (emailErr: any) {
        console.error(
          "⚠️ Failed to trigger /api/send-email:",
          emailErr.message || emailErr,
        );
      }
    }

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
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).json({
      success: true,
      data: subscriptions,
    });
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
app.get(
  "/api/customer_detail/:id",
  keycloak.protect(),
  handleCustomerDetailGet,
);
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
app.get("/api/public/customer_detail/:id", handleCustomerDetailGet);
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

app.post("/api/send-email", async (req: Request, res: Response) => {
  const { to, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS (STARTTLS)
      auth: {
        user: "karthimailu@gmail.com",
        pass: "zizbzdtzjubexmbx",
      },
    });

    const emailTo = to || "karthikeyanbalan.pkxlabs@gmail.com";
    const emailSubject = subject || "Test Email from Gmail SMTP";

    let htmlContent: string | undefined = undefined;
    let textContent: string = "";

    if (message) {
      textContent = message;
      if (message.trim().startsWith("<")) {
        htmlContent = message;
      } else {
        htmlContent = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #F2688C 0%, #7C3AED 100%); padding: 20px; border-radius: 6px 6px 0 0; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Soul Connect</h2>
              </div>
              <div style="padding: 24px; font-size: 15px;">
                ${message.replace(/\n/g, "<br/>")}
              </div>
              <div style="border-top: 1px solid #f0f0f0; padding-top: 16px; text-align: center; font-size: 12px; color: #888;">
                This is an automated notification. Please do not reply directly.
              </div>
            </div>`;
      }
    } else {
      textContent =
        "Hello,\nThis is a test email sent using curl without a mail.txt file.";
    }

    const mailOptions = {
      from: '"Your Name" <karthimailu@gmail.com>',
      to: emailTo,
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: info,
    });
  } catch (error: any) {
    console.error("Gmail SMTP exception:", error);
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
        baseUrl: process.env.KEYCLOAK_URL || "http://localhost:4000",
        realmName: "master", // Admin API auth usually goes through master
      });

      await kcAdminClient.auth({
        ...GLOBAL_DETAILS,
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
        baseUrl: process.env.KEYCLOAK_URL || "http://localhost:4000",
        realmName: "master",
      });

      await kcAdminClient.auth({
        ...GLOBAL_DETAILS,
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
