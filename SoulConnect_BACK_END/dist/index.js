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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
}));
app.use(express_1.default.json());
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
    const realm = process.env.KEYCLOAK_REALM || "sashti";
    const clientId = process.env.KEYCLOAK_CLIENT_ID || "sashti_c";
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
            console.error("   Status:", error.response.status, error.response.statusText);
            console.error("   Data:", JSON.stringify(error.response.data));
        }
        else {
            console.error("   Error:", error.message);
        }
    }
};
// Re-authenticate every 50 seconds to keep the admin session alive
setInterval(connectAdminClient, 50000);
connectAdminClient();
// ------------------------------------
app.use(keycloak_config_1.keycloak.middleware());
// --- MONGODB CLUSTER INTEGRATION ---
const MONGODB_URL = "mongodb+srv://admin:admin@simba-cluster.wv87zgs.mongodb.net/Simba_Sample";
mongoose_1.default
    .connect(MONGODB_URL)
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas (Simba_Sample)"))
    .catch((error) => console.error("❌ MongoDB connection error:", error));
const profileSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    email: String,
}, { collection: "simba_sample" });
const Profile = mongoose_1.default.model("Profile", profileSchema);
// -----------------------------------
app.get("/api/profile_settings", keycloak_config_1.keycloak.protect(), async (req, res) => {
    const token = req.kauth?.grant?.access_token?.content;
    const userId = token?.sub;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const profile = await Profile.findOne({ userId });
        if (profile) {
            res.json(profile);
        }
        else {
            res.json(null); // Return null so the frontend knows to fallback to Keycloak token defaults
        }
    }
    catch (err) {
        console.error("MongoDB Fetch Error:", err);
        res.status(500).json({ error: "Database error during fetch" });
    }
});
app.post("/api/profile_settings", keycloak_config_1.keycloak.protect(), async (req, res) => {
    const token = req.kauth?.grant?.access_token?.content;
    const userId = token?.sub;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { firstName, lastName, email } = req.body;
    try {
        await Profile.findOneAndUpdate({ userId }, { firstName, lastName, email }, { upsert: true, new: true });
        res.json({
            success: true,
            message: "Profile settings saved successfully.",
        });
    }
    catch (err) {
        console.error("MongoDB Save Error:", err);
        res.status(500).json({ error: "Database error during save" });
    }
});
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
const dashboardDataSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, unique: true },
    topCards: mongoose_1.default.Schema.Types.Mixed,
    expenseSources: mongoose_1.default.Schema.Types.Mixed,
    recentExpenses: mongoose_1.default.Schema.Types.Mixed,
    reportOverview: mongoose_1.default.Schema.Types.Mixed,
    expenseActivity: mongoose_1.default.Schema.Types.Mixed,
}, { collection: "dashboard_data" });
const DashboardData = mongoose_1.default.model("DashboardData", dashboardDataSchema);
app.get("/api/dashboard_info", keycloak_config_1.keycloak.protect(), async (req, res) => {
    const token = req.kauth?.grant?.access_token?.content;
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
    }
    catch (err) {
        console.error("Dashboard Fetch Error:", err);
        res.status(500).json({ error: "Database error during dashboard fetch" });
    }
});
// ----------------------------
// --- USER INFO CRUD API ---
const userInfoSchema = new mongoose_1.default.Schema({
    keycloakId: { type: String, unique: true }, // Linking to Keycloak ID
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'User' },
    status: { type: String, default: 'Active' }
}, { collection: 'user_info', timestamps: true });
const UserInfo = mongoose_1.default.model('UserInfo', userInfoSchema);
app.get('/api/users', keycloak_config_1.keycloak.protect(), async (req, res) => {
    try {
        const users = await UserInfo.find({}).sort({ createdAt: -1 });
        res.json(users);
    }
    catch (err) {
        console.error("Fetch Users Error:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
app.post('/api/users', keycloak_config_1.keycloak.protect(), async (req, res) => {
    const { firstName, lastName, email, role, status } = req.body;
    console.log("🚀 Attempting to create user:", email);
    try {
        // 1. Create User in Keycloak
        const kcUser = await kcAdminClient.users.create({
            username: email,
            email,
            firstName,
            lastName,
            enabled: status === 'Active',
            emailVerified: true,
        });
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
            status
        });
        await newUser.save();
        console.log("✅ User saved in MongoDB");
        res.json(newUser);
    }
    catch (err) {
        console.error("❌ Create User Error Detaiils:");
        if (err.response) {
            console.error("Keycloak Status Code:", err.response.status);
            console.error("Keycloak Error Message:", err.response.data);
        }
        else {
            console.error("Error Message:", err.message);
            console.error("Stack Trace:", err.stack);
        }
        const message = err.response?.data?.errorMessage || err.message || "Failed to create user";
        res.status(500).json({ error: message });
    }
});
app.put('/api/users/:id', keycloak_config_1.keycloak.protect(), async (req, res) => {
    const { firstName, lastName, email, role, status } = req.body;
    try {
        const user = await UserInfo.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // 1. Update User in Keycloak
        if (user.keycloakId) {
            await kcAdminClient.users.update({ id: user.keycloakId }, {
                firstName,
                lastName,
                email,
                enabled: status === 'Active'
            });
        }
        // 2. Update User in MongoDB
        const updatedUser = await UserInfo.findByIdAndUpdate(req.params.id, { firstName, lastName, email, role, status }, { new: true });
        res.json(updatedUser);
    }
    catch (err) {
        console.error("Update User Error:", err);
        res.status(500).json({ error: "Failed to update user" });
    }
});
app.delete('/api/users/:id', keycloak_config_1.keycloak.protect(), async (req, res) => {
    try {
        const user = await UserInfo.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // 1. Delete User from Keycloak
        if (user.keycloakId) {
            await kcAdminClient.users.del({ id: user.keycloakId });
        }
        // 2. Delete User from MongoDB
        await UserInfo.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted successfully from Keycloak and DB" });
    }
    catch (err) {
        console.error("Delete User Error:", err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});
// ----------------------------
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
app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});
