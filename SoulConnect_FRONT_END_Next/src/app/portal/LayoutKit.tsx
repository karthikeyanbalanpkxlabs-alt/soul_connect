"use client";

import SideBarKit from "@/components/SideBarKit";
import Navbar from "@/components/Navbar";
import { useKeycloak } from "@/providers/KeycloakProvider";

export default function LayoutKit({ children }: { children: React.ReactNode }) {
  const { roles, authenticated } = useKeycloak();

  if (!authenticated) {
    return <div>Authenticating...</div>;
  }

  const role =
    roles.find((r) => r === "manager_g" || r === "customer_g") || "no_roles";

  return (
    <>
      {role === "manager_g" ? (
        <SideBarKit>{children}</SideBarKit>
      ) : role === "customer_g" ? (
        <>
          <Navbar />
          {children}
        </>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
