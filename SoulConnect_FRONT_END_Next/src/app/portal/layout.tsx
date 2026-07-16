import KeycloakProvider from "@/providers/KeycloakProvider";
import LayoutKit from "./LayoutKit";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeycloakProvider>
      <LayoutKit>{children}</LayoutKit>
    </KeycloakProvider>
  );
}
