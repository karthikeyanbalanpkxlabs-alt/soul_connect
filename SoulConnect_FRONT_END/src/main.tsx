import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import keycloak from "./keycloak";

const pageLoad = () => {
  console.log("Trigger pageLoad ");
  return createRoot(document.getElementById("root")!).render(<App />);
};

const load = () => {
  const { pathname = "" } = window.location || {};
  if (pathname.includes("portal")) {
    // if (keycloak.authenticated !== undefined) {
    //   pageLoad();
    //   return;
    // }
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
