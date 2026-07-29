"use client";

import SideBarKit from "@/components/SideBarKit";
import Navbar from "@/components/Navbar";
import { useKeycloak } from "@/providers/KeycloakProvider";
import { LoaderCircle, ShieldCheck } from "lucide-react";
export default function LayoutKit({ children }: { children: React.ReactNode }) {
  const { roles, authenticated } = useKeycloak();

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="w-96 rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>

          <LoaderCircle className="mx-auto mt-6 h-10 w-10 animate-spin text-blue-600" />

          <h1 className="mt-5 text-xl font-semibold text-slate-900">
            Authenticating...
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we securely sign you in.
          </p>
        </div>
      </div>
    );
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
