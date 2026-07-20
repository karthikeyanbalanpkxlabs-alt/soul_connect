"use client";

import { useState } from "react";
import CardPage from "./customer/CardPage";
import Dashboard from "./Dashboard";
import { useKeycloak } from "@/providers/KeycloakProvider";

export default function Home() {
  const { profile } = useKeycloak();
  console.log("profile", profile);
  const isCustomerRole = profile?.role === "customer_g";
  return (
    <div style={{ marginTop: 70 }}>
      {isCustomerRole ? <CardPage /> : <Dashboard />}
    </div>
  );
}
