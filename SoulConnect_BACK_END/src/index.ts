import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { keycloak, sessionStore } from "./keycloak-config";
import { connectDB } from "./config/db";
import apiRoutes from "./routes/apiRoutes";

// Import Keycloak admin client to trigger connection keep-alive
import "./config/keycloak-admin";

dotenv.config();

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
    ],
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

app.use(keycloak.middleware());

// Connect database and seed customers
connectDB();

// Mount Routes under /api prefix
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
