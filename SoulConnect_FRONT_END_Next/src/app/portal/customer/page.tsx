"use client";
import React from "react";
import ListPage from "./ListPage";
import CardPage from "./CardPage";
import keycloak from "../../../lib/keycloak";
import { useKeycloak } from "@/providers/KeycloakProvider";
function PortalPage() {

  const tokenParsed: any = keycloak?.tokenParsed;
  let roles: any = tokenParsed?.realm_access?.roles || [];
  roles = roles?.filter(
    (itm: any) => itm === "manager_g" || itm === "customer_g",
  );
  roles = roles?.length > 0 ? roles[0] : "no_roles";



  return roles === 'customer_g' ? <CardPage/> : <ListPage />;
}

export default PortalPage;
