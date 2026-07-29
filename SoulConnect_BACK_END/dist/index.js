"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const keycloak_config_1 = require("./keycloak-config");
const db_1 = require("./config/db");
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
// Import Keycloak admin client to trigger connection keep-alive
require("./config/keycloak-admin");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.disable("etag");
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://dev.soulconect.com",
        "https://soulconect.com",
    ],
    credentials: true,
}));
app.use(express_1.default.json({ limit: "500mb" }));
app.use(express_1.default.urlencoded({ limit: "500mb", extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "my-super-secret-session-key",
    resave: false,
    saveUninitialized: true,
    store: keycloak_config_1.sessionStore,
}));
app.use(keycloak_config_1.keycloak.middleware());
// Connect database and seed customers
(0, db_1.connectDB)();
// Mount Routes under /api prefix
app.use("/api", apiRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});
