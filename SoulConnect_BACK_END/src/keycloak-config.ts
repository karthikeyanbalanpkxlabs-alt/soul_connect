import Keycloak from "keycloak-connect";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();

const memoryStore = new session.MemoryStore();

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM ,
  "auth-server-url": process.env.KEYCLOAK_URL,
  "ssl-required": "external",
  resource: process.env.KEYCLOAK_CLIENT_ID ,
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
  "confidential-port": 0,
  "bearer-only": true,
};

export const keycloak = new Keycloak(
  { store: memoryStore },
  keycloakConfig as any,
);
export const sessionStore = memoryStore;
