"use client";

import CardPage from "./customer/CardPage";
import Dashboard from "./Dashboard";
import { useKeycloak } from "@/providers/KeycloakProvider";
import keycloak from "@/lib/keycloak";
import { UserX, RefreshCw, UserPlus, LogOut } from "lucide-react";

export default function Home() {
  const { profile, loadingProfile, profileError, refreshProfile } = useKeycloak();

  if (loadingProfile) {
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

  if (!profile) {
    const handleLogout = () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("logged_in");
        sessionStorage.clear();
        const regUrl = window.location.origin.includes("localhost")
          ? "http://localhost:5174/#register"
          : "https://dev.soulconect.com/#register";
        try {
          keycloak.logout({ redirectUri: regUrl });
        } catch (e) {
          window.location.href = regUrl;
        }
      }
    };

    return (
      <div className="flex min-h-[75vh] w-full flex-col items-center justify-center bg-gradient-to-br from-rose-50/60 via-white to-amber-50/40 p-6 mt-[70px]">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-rose-100 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-100/50 rounded-full blur-2xl pointer-events-none" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-5 border border-rose-100">
            <UserX className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Profile Not Found</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {profileError ||
              "We couldn't find a registered customer profile associated with your account. Please create a new profile or sign in with registered credentials."}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  const regUrl = window.location.origin.includes("localhost")
                    ? "http://localhost:5174/#register"
                    : "https://dev.soulconect.com/#register";
                  window.location.href = regUrl;
                }
              }}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Create Free Profile
            </button>

            <button
              onClick={refreshProfile}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry Loading Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-rose-600 hover:bg-rose-50 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
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
