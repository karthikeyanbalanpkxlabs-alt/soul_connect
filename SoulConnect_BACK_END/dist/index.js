"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const keycloak_config_1 = require("./keycloak-config");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const keycloak_admin_client_1 = __importDefault(require("@keycloak/keycloak-admin-client"));
const nodemailer = require("nodemailer");
// import KcAdminClient from '@keycloak/keycloak-admin-client'
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "my-super-secret-session-key",
    resave: false,
    saveUninitialized: true,
    store: keycloak_config_1.sessionStore,
}));
// --- KEYCLOAK ADMIN CLIENT SETUP ---
const kcAdminClient = new keycloak_admin_client_1.default({
    baseUrl: process.env.KEYCLOAK_URL || "http://localhost:4000",
    realmName: process.env.KEYCLOAK_REALM || "sashti",
});
const connectAdminClient = async () => {
    const baseUrl = process.env.KEYCLOAK_URL || "http://localhost:4000";
    const realm = process.env.KEYCLOAK_REALM || "soul_connect";
    const clientId = process.env.KEYCLOAK_CLIENT_ID || "soul_connect_c";
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
    console.log(`📡 Attempting Keycloak Admin Auth: [${baseUrl}] Realm: [${realm}] Client: [${clientId}]`);
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
    }
    catch (error) {
        console.error("❌ Keycloak Admin Client Authentication Failed:");
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Error:", error.response.data?.error || error.response.statusText);
            console.error("   Description:", error.response.data?.error_description || "No description provided");
        }
        else {
            console.error("   Error Message:", error.message);
        }
    }
};
// Re-authenticate every 50 seconds to keep the admin session alive
setInterval(connectAdminClient, 50000);
connectAdminClient();
// ------------------------------------
app.use(keycloak_config_1.keycloak.middleware());
// --- MONGODB CLUSTER INTEGRATION ---
const MONGODB_URL = "mongodb+srv://karthimailu_db_user:Rma1zgLmDktUJ3yD@soulconnectcluster.uszzhth.mongodb.net/soul_connect_india";
// const MONGODB_URL =
//   "mongodb+srv://admin:admin@simba-cluster.wv87zgs.mongodb.net/Simba_Sample";
const customerSchema = new mongoose_1.default.Schema({
    keycloakId: { type: String, unique: true, sparse: true },
    firstName: String,
    lastName: String,
    first_name: String,
    last_name: String,
    email: String,
}, { collection: "customers", strict: false });
const Customers = mongoose_1.default.model("Customers", customerSchema);
// Seeding function from sample_customer.json if database is empty
const seedCustomers = async () => {
    try {
        const count = await Customers.countDocuments();
        if (count === 0) {
            console.log("🌱 Customers collection is empty. Seeding from sample_customer.json...");
            const pathsToTry = [
                path_1.default.join(__dirname, "sample_customer.json"),
                path_1.default.join(__dirname, "../src/sample_customer.json"),
                path_1.default.join(__dirname, "../sample_customer.json"),
                path_1.default.join(process.cwd(), "src/sample_customer.json"),
                path_1.default.join(process.cwd(), "sample_customer.json")
            ];
            let filePath = "";
            for (const p of pathsToTry) {
                if (fs_1.default.existsSync(p)) {
                    filePath = p;
                    break;
                }
            }
            if (filePath) {
                const rawData = fs_1.default.readFileSync(filePath, "utf-8");
                const sampleData = JSON.parse(rawData);
                const processedData = sampleData.map((cust) => {
                    if (cust._id && cust._id.$oid) {
                        cust._id = new mongoose_1.default.Types.ObjectId(cust._id.$oid);
                    }
                    return cust;
                });
                await Customers.insertMany(processedData);
                console.log(`✅ Successfully seeded ${processedData.length} customers!`);
            }
            else {
                console.warn("⚠️ Seed file sample_customer.json not found in search paths.");
            }
        }
    }
    catch (err) {
        console.error("❌ Failed to seed customers:", err);
    }
};
mongoose_1.default
    .connect(MONGODB_URL, { dbName: "soul_connect_india" })
    .then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas (soul_connect_india)");
    seedCustomers();
})
    .catch((error) => console.error("❌ MongoDB connection error:", error));
// -----------------------------------
// GET /api/customer_list for frontend compatibility (protected by keycloak)
app.get("/api/customer_list", keycloak_config_1.keycloak.protect(), async (req, res) => {
    const token = req.kauth?.grant?.access_token?.content;
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
        }
        else {
            console.log(`🔍 Customer not found by keycloakId. Searching by email: [${email}]...`);
            if (email) {
                customer = await Customers.findOne({ email });
                if (customer) {
                    console.log(`✅ Customer found by email. Linking keycloakId: ${keycloakId}`);
                    await Customers.updateOne({ _id: customer._id }, { $set: { keycloakId } });
                    customer.keycloakId = keycloakId;
                }
                else {
                    console.log(`❌ Customer not found by email: [${email}] in database.`);
                    const dbEmails = await Customers.find({}, 'email').limit(10);
                    console.log(`📋 Existing customer emails in DB (up to 10):`, dbEmails.map(c => c.email));
                }
            }
            else {
                console.warn("⚠️ Token email field is undefined!");
            }
        }
        if (customer) {
            res.json(customer);
        }
        else {
            res.json(null);
        }
    }
    catch (err) {
        console.error("MongoDB Fetch Error:", err);
        res.status(500).json({ error: "Database error during fetch" });
    }
});
// Helper handlers to be reused for both Keycloak-protected and public endpoints
async function handleCustomerList(req, res) {
    try {
        const filter = req.body.filter || {};
        const limit = parseInt(req.body.limit) || 100;
        const skip = parseInt(req.body.skip) || 0;
        const list = await Customers.find(filter).skip(skip).limit(limit);
        res.json(list);
    }
    catch (err) {
        console.error("customer_list error:", err);
        res.status(500).json({ error: err.message || "Failed to fetch customer list" });
    }
}
async function handleCustomerDetail(req, res) {
    try {
        const { id, customer_id, email, keycloakId } = req.body;
        let query = {};
        if (id)
            query._id = id;
        else if (customer_id)
            query.customer_id = customer_id;
        else if (email)
            query.email = email;
        else if (keycloakId)
            query.keycloakId = keycloakId;
        else {
            return res.status(400).json({ error: "Missing identifier (id, customer_id, email, or keycloakId) in request body" });
        }
        const customer = await Customers.findOne(query);
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json(customer);
    }
    catch (err) {
        console.error("customer_detail error:", err);
        res.status(500).json({ error: err.message || "Failed to fetch customer detail" });
    }
}
async function handleCustomerEdit(req, res) {
    try {
        const { id, customer_id, email, keycloakId, ...updateFields } = req.body;
        let query = {};
        if (id)
            query._id = id;
        else if (customer_id)
            query.customer_id = customer_id;
        else if (email)
            query.email = email;
        else if (keycloakId)
            query.keycloakId = keycloakId;
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
        const customer = await Customers.findOneAndUpdate(query, { $set: updateFields }, { new: true, runValidators: true });
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json({ success: true, message: "Customer updated successfully", customer });
    }
    catch (err) {
        console.error("customer_edit error:", err);
        res.status(500).json({ error: err.message || "Failed to update customer" });
    }
}
async function handleCustomerDelete(req, res) {
    try {
        const { id, customer_id, email, keycloakId } = req.body;
        let query = {};
        if (id)
            query._id = id;
        else if (customer_id)
            query.customer_id = customer_id;
        else if (email)
            query.email = email;
        else if (keycloakId)
            query.keycloakId = keycloakId;
        else {
            return res.status(400).json({ error: "Missing identifier (id, customer_id, email, or keycloakId) in request body" });
        }
        const customer = await Customers.findOneAndDelete(query);
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json({ success: true, message: "Customer deleted successfully" });
    }
    catch (err) {
        console.error("customer_delete error:", err);
        res.status(500).json({ error: err.message || "Failed to delete customer" });
    }
}
async function handleCustomerCreate(req, res) {
    try {
        const { firstName, lastName, first_name, last_name, email, ...otherFields } = req.body;
        if (email) {
            const existing = await Customers.findOne({ email });
            if (existing) {
                return res.status(400).json({ error: "Customer with this email already exists" });
            }
        }
        const first = firstName || first_name;
        const last = lastName || last_name;
        const customer_id = req.body.customer_id || `cid_${new mongoose_1.default.Types.ObjectId()}`;
        const newCustomer = new Customers({
            customer_id,
            firstName: first,
            lastName: last,
            first_name: first,
            last_name: last,
            email,
            ...otherFields
        });
        await newCustomer.save();
        res.status(201).json({ success: true, message: "Customer created successfully", customer: newCustomer });
    }
    catch (err) {
        console.error("customer_create error:", err);
        res.status(500).json({ error: err.message || "Failed to create customer" });
    }
}
// --- CUSTOMER APIs (With Keycloak Access / Protected) ---
app.post("/api/customer_list", keycloak_config_1.keycloak.protect(), handleCustomerList);
app.post("/api/customer_detail", keycloak_config_1.keycloak.protect(), handleCustomerDetail);
app.post("/api/customer_edit", keycloak_config_1.keycloak.protect(), handleCustomerEdit);
app.post("/api/customer_delete", keycloak_config_1.keycloak.protect(), handleCustomerDelete);
app.post("/api/customer_create", keycloak_config_1.keycloak.protect(), handleCustomerCreate);
// --- CUSTOMER APIs (Without Keycloak Access / Public) ---
app.post("/api/public/customer_list", handleCustomerList);
app.post("/api/public/customer_detail", handleCustomerDetail);
app.post("/api/public/customer_edit", handleCustomerEdit);
app.post("/api/public/customer_delete", handleCustomerDelete);
app.post("/api/public/customer_create", handleCustomerCreate);
app.get("/api/public", (req, res) => {
    res.json({
        message: "This is a public endpoint. No authentication required.",
    });
});
app.get("/api/protected", keycloak_config_1.keycloak.protect(), (req, res) => {
    res.json({
        message: "This is a protected endpoint. You are authenticated!",
        user: req.kauth?.grant?.access_token?.content,
    });
});
const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.GMAIL_USER || 'karthikeyanbalan.pklabs@gmail.com',
        pass: process.env.GMAIL_PASS || 'cuewzkscbjbcjnjr',
    },
});
app.post("/api/send-email", async (req, res) => {
    const { to, subject, message } = req.body;
    try {
        console.log(to, subject, message);
        await transporter.sendMail({
            from: process.env.GMAIL_USER || 'karthikeyanbalan.pklabs@gmail.com',
            to,
            subject,
            html: `<h1>${message}</h1>`,
        });
        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error?.message,
        });
    }
});
app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});
