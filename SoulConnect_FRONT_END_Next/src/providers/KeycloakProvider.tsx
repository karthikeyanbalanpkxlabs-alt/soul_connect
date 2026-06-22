"use client";

import { useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

export default function KeycloakProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    keycloak
      .init({
        onLoad: "login-required",
        pkceMethod: "S256",
      })
      .then(() => {
        setReady(true);
      })
      .catch(console.error);
  }, []);

  if (!ready) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

// "use client";

// import { createContext, useEffect, useState } from "react";
// import keycloak from "@/lib/keycloak";

// export const KeycloakContext = createContext<any>(null);

// export default function KeycloakProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [authenticated, setAuthenticated] = useState(false);

//   useEffect(() => {
//     keycloak
//       .init({
//         onLoad: "check-sso",
//         pkceMethod: "S256",
//       })
//       .then((auth) => {
//         setAuthenticated(auth);
//       })
//       .catch((err) => {
//         console.error("Keycloak init failed", err);
//       });
//   }, []);

//   return (
//     <KeycloakContext.Provider
//       value={{
//         keycloak,
//         authenticated,
//       }}
//     >
//       {children}
//     </KeycloakContext.Provider>
//   );
// }
