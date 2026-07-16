"use client";

import { createContext, useContext, useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

interface KeycloakContextType {
  authenticated: boolean;
  roles: string[];
}

const KeycloakContext = createContext<KeycloakContextType>({
  authenticated: false,
  roles: [],
});

export const useKeycloak = () => useContext(KeycloakContext);

// Keep track of the initialization promise to prevent multiple init calls.
let initPromise: Promise<boolean> | null = null;

export default function KeycloakProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!initPromise) {
        initPromise = keycloak.init({
          onLoad: "login-required",
          pkceMethod: "S256",
          checkLoginIframe: false,
        });
      }

      initPromise
        .then((auth) => {
          localStorage.setItem("logged_in", auth ? "true" : "false");
          setAuthenticated(auth);
          setRoles(keycloak.realmAccess?.roles || []);
          setReady(true);
        })
        .catch((err) => {
          console.error("Keycloak initialization failed", err);
        });
    }
  }, []);

  if (!ready) {
    return <div>Authenticating...</div>;
  }

  return (
    <KeycloakContext.Provider value={{ authenticated, roles }}>
      {children}
    </KeycloakContext.Provider>
  );
}
