import { useState } from "react";
import {
  Home,
  Users,
  Settings,
  Package,
  BarChart3,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import keycloak from "../keycloak";
import { useNavigate } from "react-router-dom";
function SideBarKit() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menus = [
    { name: "Landing", icon: Home, router: "/portal" },
    { name: "Customer", icon: Users, router: "/portal/customer" },
    { name: "Profile", icon: Settings, router: "/portal/profile" },
  ];

  const tokenParsed: any = keycloak?.tokenParsed;
  let roles: any = tokenParsed?.realm_access?.roles || [];
  roles = roles?.filter(
    (itm: any) => itm === "manager_admin" || itm === "customer_admin",
  );
  roles = roles?.length > 0 ? roles[0] : "no_roles";
  let name = keycloak.tokenParsed?.preferred_username;
  if (roles?.includes("manager") && location.href.includes("portal")) {
    return (
      <div
        style={{ borderRight: "1px solid var(--border-soft)" }}
        className={`h-screen bg-white text-white transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Logo & Toggle */}
        <div
          style={{ borderBottom: "1px solid var(--border-soft)" }}
          className="flex items-center justify-between p-4  border-slate-700"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {!collapsed ? (
              <a href="#" className="nav-logo">
                Soul<span>Connect</span>
                <div className="logo-dot"></div>
              </a>
            ) : (
              <a href="#" className="nav-logo">
                S<span>C</span>
                <div className="logo-dot"></div>
              </a>
            )}
            {/* <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              B
            </div>

            {!collapsed && (
              <h1 className="text-lg font-semibold whitespace-nowrap">
                BK Portal
              </h1>
            )} */}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded bg-white hover:bg-white"
          >
            {collapsed ? (
              <Menu color="#7c3aed" size={20} />
            ) : (
              <ChevronLeft color="#7c3aed" size={20} />
            )}
          </button>
        </div>

        {/* Menu */}
        <div className="mt-4">
          {menus?.map((menu: any) => {
            const Icon = menu.icon;
            return (
              <div
                style={{ cursor: "pointer" }}
                key={menu.name}
                className="w-full c-p flex items-center gap-3 px-4 py-3 bg-white transition-colors"
                onClick={() => navigate(menu?.router)}
              >
                <Icon size={20} color="#7c3aed" />
                {!collapsed && (
                  <span
                    style={{ color: "#7c3aed" }}
                    className="text-sm font-medium"
                  >
                    {menu.name}
                  </span>
                )}
              </div>
            );
          })}

          <div
            key={"Logout"}
            style={{ cursor: "pointer" }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white transition-colors"
            onClick={
              () => keycloak.logout()
              // keycloak.logout({
              //   redirectUri: "http://localhost:5173",
              // })
            }
          >
            <LogOut size={20} color="#7c3aed" />
            {!collapsed && (
              <span
                style={{ color: "#7c3aed" }}
                className="text-sm font-medium"
              >
                {"Logout"}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}

export default SideBarKit;
