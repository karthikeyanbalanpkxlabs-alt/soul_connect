"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Users, Settings, Menu, ChevronLeft, LogOut } from "lucide-react";

import keycloak from "../lib/keycloak";

interface SideBarKitProps {
  children: React.ReactNode;
}

export default function SideBarKit({ children }: SideBarKitProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

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
    <div className="flex flex-1">
      {/* Sidebar */}
      <div
        style={{
          borderRight: "1px solid var(--border-soft)",
        }}
        className={`relative overflow-hidden h-screen bg-white transition-all duration-300
        ${collapsed ? "w-[110px]" : "w-64"}`}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid var(--border-soft)",
          }}
          className="flex items-center justify-between p-4"
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
            const isActive = pathname === menu.router;

            return (
              <div
                key={menu.name}
                onClick={() => router.push(menu.router)}
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
                  className={isActive ? "text-pink-500" : "text-violet-600"}
                />

                {!collapsed && (
                  <span
                    className={`text-sm font-medium
                    ${isActive ? "text-pink-500" : "text-violet-600"}`}
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
              onClick={() => keycloak.logout()}
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
      <div className="flex-1">{children}</div>
    </div>
  );
}
