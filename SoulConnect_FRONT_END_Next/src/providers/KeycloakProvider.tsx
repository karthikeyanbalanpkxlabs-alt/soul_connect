"use client";

import { LoaderCircle, ShieldCheck } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import keycloak from "@/lib/keycloak";
import configUrls from "../../configUrls";

export interface UserProfile {
  _id?: string;
  customer_id?: string;
  keycloakId?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  dob?: string;
  age?: number;
  phone?: string;
  district?: string;
  city?: string;
  occupation?: string;
  education?: string;
  marital_status?: string;
  religion?: string;
  caste?: string;
  height?: string;
  photos?: string[];
  public_verify?: boolean;
  identity_proff?: any;
  [key: string]: any;
}

interface KeycloakContextType {
  authenticated: boolean;
  roles: string[];
  profile: UserProfile | null;
  loadingProfile: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
}

const KeycloakContext = createContext<KeycloakContextType>({
  authenticated: false,
  roles: [],
  profile: null,
  loadingProfile: false,
  profileError: null,
  refreshProfile: async () => {},
});

export const useKeycloak = () => useContext(KeycloakContext);

// Keep track of the initialization promise to prevent multiple init calls.
let initPromise: Promise<boolean> | null = null;

export default function KeycloakProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!keycloak.token) return;
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const apiUrl = configUrls?.apiUrl || "http://localhost:3000";
      const tokenParsed: any = keycloak.tokenParsed;
      const keycloakId = tokenParsed?.sub;
      const email = tokenParsed?.email;

      const res = await fetch(`${apiUrl}/api/profile_detail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keycloakId,
          email,
        }),
      });

      if (!res.ok) {
        throw new Error(`Profile fetch status: ${res.status}`);
      }

      const data = await res.json();
      setProfile(data);
    } catch (err: any) {
      console.error("Failed to fetch profile details:", err);
      setProfileError(err.message || "Failed to load profile details");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!initPromise) {
        initPromise = keycloak.init({
          onLoad: "login-required",
          pkceMethod: "S256",
          checkLoginIframe: false,
        });
      }

      initPromise
        .then((auth) => {
          localStorage.setItem("logged_in", auth ? "true" : "false");
          setAuthenticated(auth);
          setRoles(keycloak.realmAccess?.roles || []);
          setReady(true);
          if (auth) {
            fetchProfile();
          }
        })
        .catch((err) => {
          console.error("Keycloak initialization failed", err);
        });
    }
  }, [fetchProfile]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="w-96 rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>

          <LoaderCircle className="mx-auto mt-6 h-10 w-10 animate-spin text-blue-600" />

          <h1 className="mt-5 text-xl font-semibold text-slate-900">
            Authenticating...
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we securely sign you in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <KeycloakContext.Provider
      value={{
        authenticated,
        roles,
        profile,
        loadingProfile,
        profileError,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}
