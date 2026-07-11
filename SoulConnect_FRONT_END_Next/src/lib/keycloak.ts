import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  realm: "soul_connect",
  url: "http://103.235.105.43:4000/",
  // url: "http://localhost:4000/",
  clientId: "soul_connect_c",
});

export default keycloak;
