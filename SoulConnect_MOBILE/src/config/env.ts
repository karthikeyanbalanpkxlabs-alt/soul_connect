export const API_URL = 'https://api.soulconect.com';
export const WEB_ORIGIN = 'https://soulconect.com';
export const AUTH_URL = 'https://auth.soulconect.com';
export const KEYCLOAK_REALM = 'soul_connect';
export const KEYCLOAK_CLIENT_ID = 'soul_connect_c';
export const KEYCLOAK_REDIRECT_URI = `${WEB_ORIGIN}/`;

export const keycloakBase = `${AUTH_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect`;
