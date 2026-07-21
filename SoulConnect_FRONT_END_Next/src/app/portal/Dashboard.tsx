"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import configUrls from "../../../configUrls";
import keycloak from "../../lib/keycloak";
import { useKeycloak } from "@/providers/KeycloakProvider";
import {
  Users,
  Clock,
  CheckCircle,
  CreditCard,
  RefreshCw,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Heart,
  ShieldCheck,
} from "lucide-react";

interface DashboardStats {
  totalCustomers: number;
  approvedCustomers: number;
  pendingCustomers: number;
  maleCount: number;
  femaleCount: number;
  managerCount: number;
  customerRoleCount: number;
  totalSubscriptions: number;
}

interface SubscriptionBreakdown {
  type: string;
  count: number;
}

interface TopDistrict {
  district: string;
  count: number;
}

const Dashboard = () => {
  const router = useRouter();
  const { profile } = useKeycloak();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subBreakdown, setSubBreakdown] = useState<SubscriptionBreakdown[]>([]);
  const [districts, setDistricts] = useState<TopDistrict[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const token = keycloak?.token;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const endpoint = token
        ? `${configUrls.apiUrl}/api/dashboard_analytics`
        : `${configUrls.apiUrl}/api/public/dashboard_analytics`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setSubBreakdown(data.subscriptionBreakdown || []);
          setDistricts(data.topDistricts || []);
          setRecentCustomers(data.recentCustomers || []);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getFirstName = (cust: any) =>
    cust?.first_name || cust?.firstName || "Customer";
  const getLastName = (cust: any) => cust?.last_name || cust?.lastName || "";
  const getFullName = (cust: any) =>
    `${getFirstName(cust)} ${getLastName(cust)}`.trim();

  // Calculations for ratios
  const totalGenders = (stats?.maleCount || 0) + (stats?.femaleCount || 0) || 1;
  const malePercent = Math.round(
    ((stats?.maleCount || 0) / totalGenders) * 100,
  );
  const femalePercent = Math.round(
    ((stats?.femaleCount || 0) / totalGenders) * 100,
  );

  const totalCust = stats?.totalCustomers || 1;
  const approvalRate = Math.round(
    ((stats?.approvedCustomers || 0) / totalCust) * 100,
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-rose-900 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-rose-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SoulConnect Analytics Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back,{" "}
              {profile?.first_name || profile?.firstName || "Manager"} 👋
            </h1>
            <p className="text-purple-200/90 text-sm mt-1 max-w-xl">
              Here is your operational snapshot of profile registrations,
              verification status, and membership statistics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/portal/customer")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-950 hover:bg-rose-50 font-semibold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-purple-800" />
              <span>Manage Customers</span>
            </button>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Refresh Analytics"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 animate-pulse flex items-center justify-between"
            >
              <div className="space-y-3 flex-1">
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-8 w-16 bg-slate-300 rounded"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Profiles */}
          <div className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Profiles
              </span>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">
                {stats?.totalCustomers ?? 0}
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Active Cluster
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Registered customers in database
            </p>
          </div>

          {/* Card 2: Approved Profiles */}
          <div className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Verified & Approved
              </span>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">
                {stats?.approvedCustomers ?? 0}
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {approvalRate}% rate
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Publicly verified & published
            </p>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Approval
              </span>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-600">
                {stats?.pendingCustomers ?? 0}
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                Action Req.
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Awaiting admin review</p>
          </div>

          {/* Card 4: Staff & Managers */}
          <div className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Managers
              </span>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">
                {stats?.managerCount ?? 0}
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                Staff Tier
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Portal management accounts
            </p>
          </div>
        </div>
      )}

      {/* Analytics Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gender Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Gender Distribution</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Total Ratio
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Male Meter */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Male Profiles
                </span>
                <span className="text-slate-900">
                  {stats?.maleCount ?? 0} ({malePercent}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${malePercent}%` }}
                ></div>
              </div>
            </div>

            {/* Female Meter */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Female Profiles
                </span>
                <span className="text-slate-900">
                  {stats?.femaleCount ?? 0} ({femalePercent}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-pink-600 rounded-full transition-all duration-500"
                  style={{ width: `${femalePercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Customer Role Accounts:</span>
            <span className="font-bold text-slate-900">
              {stats?.customerRoleCount ?? 0}
            </span>
          </div>
        </div>

        {/* Subscription Plan Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <span>Subscription Breakdown</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Plan Tiers
            </span>
          </div>

          <div className="space-y-3">
            {subBreakdown.length > 0 ? (
              subBreakdown.map((item, idx) => {
                const colors = [
                  "bg-indigo-500",
                  "bg-rose-500",
                  "bg-amber-500",
                  "bg-emerald-500",
                  "bg-purple-500",
                ];
                const bg = colors[idx % colors.length];
                const pct = Math.round(
                  (item.count / (stats?.totalCustomers || 1)) * 100,
                );
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="capitalize text-slate-700">
                        {item.type}
                      </span>
                      <span className="text-slate-900 font-bold">
                        {item.count} profiles ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${bg} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No subscription data available
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs text-indigo-950 font-medium">
            <span>Total Subscription Packages:</span>
            <span className="font-extrabold text-indigo-600">
              {stats?.totalSubscriptions ?? 0}
            </span>
          </div>
        </div>

        {/* Top Locations / Districts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>Top District Hubs</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Geographic
            </span>
          </div>

          <div className="space-y-2.5">
            {districts.length > 0 ? (
              districts.map((dist, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-rose-50/50 hover:border-rose-100 transition-colors"
                >
                  <span className="text-xs font-semibold capitalize text-slate-800">
                    {dist.district}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white text-xs font-bold text-rose-600 border border-rose-100 shadow-2xs">
                    {dist.count} members
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No location metrics recorded yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Profile Registrations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Recent Customer Registrations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest profiles registered across the SoulConnect network
            </p>
          </div>
          <button
            onClick={() => router.push("/portal/customer")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>View All Profiles</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Gender</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentCustomers.length > 0 ? (
                recentCustomers.map((cust, idx) => {
                  const name = getFullName(cust);
                  const isApproved = cust?.public_verify === true;
                  return (
                    <tr
                      key={cust._id || idx}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-extrabold flex items-center justify-center text-xs">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {cust.customer_id || cust._id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {cust.email || "N/A"}
                      </td>
                      <td className="py-4 px-6 capitalize">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                            String(cust.gender).toLowerCase() === "male"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {cust.gender || "Unspecified"}
                        </span>
                      </td>
                      <td className="py-4 px-6 capitalize text-slate-600">
                        {cust.role
                          ? String(cust.role).replace("_g", "")
                          : "Customer"}
                      </td>
                      <td className="py-4 px-6 capitalize text-slate-600">
                        {cust.district || cust.state ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {[cust.district, cust.state]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Approved
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Wait for approval
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-400 italic"
                  >
                    No customer registrations available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
export default Dashboard;
