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
} from "lucide-react";

import keycloak from "../lib/keycloak";

interface SideBarKitProps {
  children: React.ReactNode;
}

export default function SideBarKit({ children }: SideBarKitProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change automatically
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const menus = [
    {
      name: "Landing",
      icon: Home,
      router: "/portal",
    },
    {
      name: "Customer",
      icon: Users,
      router: "/portal/customer",
    },
    {
      name: "Profile",
      icon: Settings,
      router: "/portal/profile",
    },
  ];

  const tokenParsed: any = keycloak?.tokenParsed;

  let roles =
    tokenParsed?.realm_access?.roles?.filter(
      (role: string) => role === "manager_admin" || role === "customer_admin",
    ) || [];

  const role = roles.length > 0 ? roles[0] : "no_roles";

  const isPortalUser =
    role.includes("manager") && pathname.startsWith("/portal");

  if (!isPortalUser) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-40 relative">
        <Link
          href="/portal"
          className="nav-logo"
          style={{ textDecoration: "none" }}
        >
          Soul<span>Connect</span>
          <div className="logo-dot"></div>
        </Link>
        <button
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
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          borderRight: "1px solid var(--border-soft)",
        }}
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen overflow-hidden bg-white transition-transform duration-300 transform md:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "md:w-[110px] w-64" : "w-64"}`}
      >
        {/* Header - Desktop Only */}
        <div
          style={{
            borderBottom: "1px solid var(--border-soft)",
          }}
          className="hidden md:flex items-center justify-between p-4"
        >
          <div className="flex items-center overflow-hidden pr-10">
            {!collapsed ? (
              <Link href="/" className="nav-logo">
                Soul<span>Connect</span>
                <div className="logo-dot"></div>
              </Link>
            ) : (
              <Link href="/" className="nav-logo-mini">
                S<span>C</span>
                <div className="logo-dot"></div>
              </Link>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded"
          >
            {collapsed ? (
              <Menu size={20} className="text-violet-600" />
            ) : (
              <ChevronLeft size={20} className="text-violet-600" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <div className="mt-4 px-2">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 cursor-pointer transition-all duration-200
                ${
                  isActive
                    ? "bg-pink-100 border-r-4 border-pink-500"
                    : "hover:bg-pink-50"
                }`}
              >
                <Icon
                  size={20}
                  style={{
                    margin: collapsed ? "auto" : undefined,
                  }}
                  className={isActive ? "text-[#c0436a]" : "text-violet-600"}
                />

                {!collapsed && (
                  <span
                    className={`text-sm
                    ${isActive ? "text-[#c0436a] font-bold" : "text-violet-600 font-medium"}`}
                  >
                    {menu.name}
                  </span>
                )}
              </div>
            );
          })}

          {/* User Info & Logout */}
          <div className="absolute bottom-0 w-[calc(100%-20px)]">
            <div className="flex flex-col gap-1 px-4 py-2 rounded-lg text-left">
              <div className="overflow-hidden capitalize">
                {keycloak?.tokenParsed?.preferred_username}
              </div>

              <div className="capitalize">{role.replaceAll("_admin", "")}</div>
            </div>

            <div
              onClick={() => {
                localStorage.clear();
                keycloak.logout();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-red-50 transition-all duration-200"
            >
              <LogOut
                size={20}
                style={{
                  margin: collapsed ? "auto" : undefined,
                }}
                className="text-red-500"
              />

              {!collapsed && (
                <span className="text-sm font-medium text-red-500">Logout</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
