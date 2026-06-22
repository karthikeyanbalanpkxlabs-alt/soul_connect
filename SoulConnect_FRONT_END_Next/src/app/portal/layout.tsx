import KeycloakProvider from "@/providers/KeycloakProvider";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KeycloakProvider>{children}</KeycloakProvider>;
}
