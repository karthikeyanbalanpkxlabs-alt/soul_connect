"use client";

import SideBarKit from "@/components/SideBarKit";
import Navbar from "@/components/Navbar";
import { useKeycloak } from "@/providers/KeycloakProvider";

export default function LayoutKit({ children }: { children: React.ReactNode }) {
  const { roles, authenticated } = useKeycloak();

  if (!authenticated) {
    return <div>Loading...</div>;
  }

  const role =
    roles.find((r) => r === "manager_admin" || r === "customer_admin") ||
    "no_roles";

  return (
    <>
      {role === "manager_admin" ? (
        <SideBarKit>{children}</SideBarKit>
      ) : role === "customer_admin" ? (
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
