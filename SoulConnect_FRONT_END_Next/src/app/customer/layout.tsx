import KeycloakProvider from "@/providers/KeycloakProvider";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KeycloakProvider>{children}</KeycloakProvider>;
}
