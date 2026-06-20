"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStore = exports.keycloak = void 0;
const keycloak_connect_1 = __importDefault(require("keycloak-connect"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const memoryStore = new express_session_1.default.MemoryStore();
const keycloakConfig = {
    realm: process.env.KEYCLOAK_REALM,
    "auth-server-url": process.env.KEYCLOAK_URL,
    "ssl-required": "external",
    resource: process.env.KEYCLOAK_CLIENT_ID,
    credentials: {
        secret: process.env.KEYCLOAK_CLIENT_SECRET,
    },
    "confidential-port": 0,
    "bearer-only": true,
};
exports.keycloak = new keycloak_connect_1.default({ store: memoryStore }, keycloakConfig);
exports.sessionStore = memoryStore;
