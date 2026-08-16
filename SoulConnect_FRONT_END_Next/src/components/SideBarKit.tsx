"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Users,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
  X,
  ReceiptText,
  CircleDollarSign,
  CreditCard,
} from "lucide-react";

import keycloak from "../lib/keycloak";
import { useKeycloak } from "@/providers/KeycloakProvider";

interface SideBarKitProps {
  children: React.ReactNode;
}

export default function SideBarKit({ children }: SideBarKitProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useKeycloak();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change automatically
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const tokenParsed: any = keycloak?.tokenParsed;

  let roles =
    tokenParsed?.realm_access?.roles?.filter(
      (role: string) => role === "manager_g" || role === "customer_g",
    ) || [];

  const role = roles.length > 0 ? roles[0] : "no_roles";
  const isManager = role.includes("manager") || profile?.role === "manager_g";

  const menus = [
    {
      name: "Dashboard",
      icon: Home,
      router: "/portal",
    },
    {
      name: "Customer",
      icon: Users,
      router: "/portal/customer",
    },
    {
      name: "Transactions",
      icon: ReceiptText,
      router: "/portal/transaction",
    },
    {
      name: "Subscriptions",
      icon: CircleDollarSign,
      router: "/portal/subscription",
    },
    ...(isManager
      ? [
          {
            name: "Payment Account",
            icon: CreditCard,
            router: "/portal/payment_account",
          },
        ]
      : []),
    {
      name: "Profile",
      icon: Settings,
      router: "/portal/profile",
    },
  ];

  const isPortalUser =
    role.includes("manager") && pathname.startsWith("/portal");

  if (!isPortalUser) {
    return <>{children}</>;
  }

  const userName =
    profile?.first_name ||
    profile?.firstName ||
    keycloak?.tokenParsed?.preferred_username ||
    "User";

  const userEmail = profile?.email || keycloak?.tokenParsed?.email;
  const userRole = role.replaceAll("_g", "");
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-30 flex-shrink-0">
        <Link
          href="/portal"
          className="nav-logo"
          style={{ textDecoration: "none" }}
        >
          Soul<span>Conect</span>
          <div className="logo-dot"></div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded focus:outline-none"
        >
          {mobileOpen ? (
            <X size={24} className="text-violet-600" />
          ) : (
            <Menu size={24} className="text-violet-600" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          borderRight: "1px solid var(--border-soft)",
        }}
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen bg-white transition-all duration-300 flex flex-col justify-between shadow-lg md:shadow-none
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${collapsed ? "md:w-20 w-64" : "w-64"}`}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid var(--border-soft)",
          }}
          className={`flex items-center ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          } h-16 flex-shrink-0`}
        >
          {!collapsed ? (
            <>
              <Link
                href="/portal"
                className="nav-logo"
                style={{ textDecoration: "none" }}
              >
                Soul<span>Conect</span>
                <div className="logo-dot"></div>
              </Link>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="hidden md:flex p-1.5 rounded-lg hover:bg-violet-50 text-violet-600 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-violet-50 text-violet-600 transition-colors"
                title="Close menu"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-lg hover:bg-violet-50 text-violet-600 transition-colors"
              title="Expand sidebar"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1">
          {menus.map((menu) => {
            const Icon = menu.icon;
            // The root '/portal' needs an exact match, while others can use startsWith
            const isActive =
              menu.router === "/portal"
                ? pathname === menu.router || pathname === `${menu.router}/`
                : pathname?.startsWith(menu.router);

            return (
              <div
                key={menu.name}
                onClick={() => {
                  router.push(menu.router);
                  setMobileOpen(false); // close on mobile when clicked
                }}
                title={collapsed ? menu.name : undefined}
                className={`flex items-center ${
                  collapsed ? "justify-center px-2 py-3" : "px-3.5 py-2.5"
                } rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-pink-100 border-r-4 border-pink-500 font-semibold"
                    : "hover:bg-pink-50 font-medium"
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${
                    isActive ? "text-[#c0436a]" : "text-violet-600"
                  }`}
                />

                {!collapsed && (
                  <span
                    className={`ml-3 text-sm truncate ${
                      isActive ? "text-[#c0436a] font-bold" : "text-violet-600"
                    }`}
                  >
                    {menu.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* User Info & Logout (Footer) */}
        <div
          style={{
            borderTop: "1px solid var(--border-soft)",
          }}
          className="flex-shrink-0 p-3 bg-white"
        >
          {!collapsed ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold capitalize text-gray-800 truncate">
                    {userName}
                  </div>
                  {userEmail && (
                    <div
                      className="text-xs text-gray-500 truncate"
                      title={userEmail}
                    >
                      {userEmail}
                    </div>
                  )}
                  <div className="capitalize text-xs text-pink-600 font-medium truncate">
                    {userRole}
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  localStorage.clear();
                  keycloak.logout();
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={20} className="text-red-500 flex-shrink-0" />
                <span className="text-sm font-medium text-red-500 truncate">
                  Logout
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-default"
                title={`${userName} (${userRole})`}
              >
                {initial}
              </div>
              <div
                onClick={() => {
                  localStorage.clear();
                  keycloak.logout();
                }}
                title="Logout"
                className="p-2 rounded-lg cursor-pointer hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={20} className="text-red-500" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

