import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import keycloak from "./keycloak";

const pageLoad = () =>
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
const load = () => {
  const { pathname = "" } = window.location || {};

  if (pathname.includes("portal")) {
    keycloak
      .init({
        onLoad: "login-required",
        pkceMethod: "S256",
      })
      .then((authenticated) => {
        if (!authenticated) {
          keycloak.login();
          return;
        }
        pageLoad();
      })
      .catch(() => {});
  } else {
    pageLoad();
  }
};

load();
