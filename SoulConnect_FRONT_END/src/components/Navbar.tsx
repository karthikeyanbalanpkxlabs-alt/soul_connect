import keycloak from "../keycloak";
import { LogOut } from "lucide-react";
const Navbar = () => {
  const tokenParsed: any = keycloak?.tokenParsed;
  let roles: any = tokenParsed?.realm_access?.roles || [];
  roles = roles?.filter(
    (itm: any) => itm === "manager_admin" || itm === "customer_admin",
  );
  roles = roles?.length > 0 ? roles[0] : "no_roles";

  let name = keycloak.tokenParsed?.preferred_username;

  if (roles?.includes("manager")) {
    return <></>;
  } else {
    return (
      <nav>
        <a href="#" className="nav-logo">
          Soul<span>Connect</span>
          <div className="logo-dot"></div>
        </a>
        <div className="nav-links" id="navLinks">
          <a href="#districts">Districts</a>
          <a href="#how">How it works</a>
          <a href="#register">Register</a>
          <a href="#pricing">Plans</a>
          <a href="#verify">Verification</a>
          <a href="#app">App</a>

          <a href="#register" className="nav-tamil">
            பதிவு செய்யுங்கள்
          </a>
          {name?.length > 0 ? (
            <div style={{ display: "flex" }}>
              <p
                style={{
                  display: "flex",
                  marginRight: 10,
                  textTransform: "capitalize",
                }}
              >
                <svg
                  width={"15px"}
                  height={"15px"}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 5 }}
                >
                  <path
                    d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                    stroke="#000000"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>{name + " |"}</span>
              </p>
              <a
                href="#app"
                style={{
                  display: "flex",
                  marginRight: 10,
                  alignItems: "center",
                }}
                onClick={() =>
                  keycloak.logout({
                    redirectUri: "http://localhost:5173",
                  })
                }
              >
                <LogOut size={16} />
                <span style={{ marginLeft: 8 }}>Logout</span>
              </a>
            </div>
          ) : (
            <a
              href="#app"
              onClick={() => {
                window.location.href = window.location.origin + "/portal";
              }}
            >
              Login
            </a>
          )}
          <a href="#register" className="btn-nav">
            Begin Journey ✦
          </a>
        </div>
        <div className="hamburger" id="hamburger" onClick="toggleNav()">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
    );
  }
};
export { Navbar };
export default Navbar;
