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

export default function KeycloakProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    keycloak
      .init({
        onLoad: "login-required",
        pkceMethod: "S256",
      })
      .then((auth) => {
        localStorage.setItem("logged_in", auth ? "true" : "false");
        setAuthenticated(auth);
        setRoles(keycloak.realmAccess?.roles || []);
        setReady(true);
      })
      .catch(() => {
        console.error();
      });
  }, []);

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <KeycloakContext.Provider value={{ authenticated, roles }}>
      {children}
    </KeycloakContext.Provider>
  );
}
