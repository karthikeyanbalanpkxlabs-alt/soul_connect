"use client";

import CardPage from "./customer/CardPage";
import Dashboard from "./Dashboard";
import { useKeycloak } from "@/providers/KeycloakProvider";

export default function Home() {
  const { profile, loadingProfile } = useKeycloak();

  if (loadingProfile || !profile) {
    return (
      <div className="flex min-h-[75vh] w-full flex-col items-center justify-center bg-gradient-to-br from-rose-50/60 via-white to-amber-50/40 p-6 mt-[70px]">
        <div className="relative flex flex-col items-center text-center">
          <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-rose-400 via-purple-400 to-amber-400 opacity-20 blur-2xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl border border-rose-100">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-rose-500 border-t-transparent" />
            <span className="absolute text-xl animate-bounce">💖</span>
          </div>
          <p className="mt-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Loading Portal...
          </p>
        </div>
      </div>
    );
  }

  const isCustomerRole = profile?.role === "customer_g";
  return (
    <div style={{ marginTop: 70 }}>
      {isCustomerRole ? <CardPage /> : <Dashboard />}
    </div>
  );
}
