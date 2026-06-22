import KeycloakProvider from "@/providers/KeycloakProvider";
import SideBarKit from "@/components/SideBarKit";
import Navbar from "@/components/Navbar";
import keycloak from "../../lib/keycloak";

const LayoutKit = (props: any) => {
  const tokenParsed: any = keycloak?.tokenParsed;
  let roles: any = tokenParsed?.realm_access?.roles || [];
  roles = roles?.filter(
    (itm: any) => itm === "manager_admin" || itm === "customer_admin",
  );
  roles = roles?.length > 0 ? roles[0] : "no_roles";

  let name = keycloak.tokenParsed?.preferred_username;

  return (
    <>
      <SideBarKit children={props?.children} />
      <Navbar children={props?.children} />
    </>
  );
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeycloakProvider>
      <LayoutKit children={children} />
    </KeycloakProvider>
  );
}
