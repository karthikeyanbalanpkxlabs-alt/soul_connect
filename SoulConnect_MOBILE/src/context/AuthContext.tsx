import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {fetchProfile, refreshAuthToken} from '../services/api';
import {decodeJwt, isStaffRole, primaryRole, rolesFromToken, tokenExpired} from '../services/pkce';
import {clearSession, storageGet, storageKeys, storageSet} from '../services/storage';
import {UserProfile} from '../types/profile';

interface AuthContextValue {
  ready: boolean;
  authenticated: boolean;
  token: string | null;
  roles: string[];
  role: string;
  isStaff: boolean;
  profile: UserProfile | null;
  loadingProfile: boolean;
  profileError: string | null;
  signIn: (tokens: {accessToken: string; refreshToken: string; idToken?: string}) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const applyToken = useCallback(async (accessToken: string, refreshToken: string, idToken?: string) => {
    const nextRoles = rolesFromToken(accessToken);
    await storageSet(storageKeys.accessToken, accessToken);
    await storageSet(storageKeys.refreshToken, refreshToken);
    if (idToken) {
      await storageSet(storageKeys.idToken, idToken);
    }
    await storageSet(storageKeys.roles, primaryRole(nextRoles));
    await storageSet(storageKeys.loggedIn, 'true');
    setToken(accessToken);
    setRoles(nextRoles);
  }, []);

  const loadProfile = useCallback(async (accessToken: string) => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const claims = decodeJwt(accessToken);
      const result = await fetchProfile(accessToken, claims?.sub, claims?.email);
      if (!result.ok) {
        throw new Error(result.error || 'Failed to load profile');
      }
      const data = (result.data?.data || result.data) as UserProfile;
      setProfile(data);
      if (data?.role) {
        setRoles(current => Array.from(new Set([...current, String(data.role)])));
      }
    } catch (error: any) {
      setProfileError(error?.message || 'Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const signIn = useCallback(
    async (tokens: {accessToken: string; refreshToken: string; idToken?: string}) => {
      await applyToken(tokens.accessToken, tokens.refreshToken, tokens.idToken);
      await loadProfile(tokens.accessToken);
    },
    [applyToken, loadProfile],
  );

  const signOut = useCallback(async () => {
    setToken(null);
    setRoles([]);
    setProfile(null);
    setProfileError(null);
    await clearSession();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (token) {
      await loadProfile(token);
    }
  }, [loadProfile, token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let access = await storageGet(storageKeys.accessToken);
        const refresh = await storageGet(storageKeys.refreshToken);
        if (access && tokenExpired(access) && refresh) {
          const next = await refreshAuthToken(refresh);
          if (cancelled) {
            return;
          }
          await applyToken(next.access_token, next.refresh_token || refresh, next.id_token);
          access = next.access_token;
        } else if (access && !cancelled) {
          setToken(access);
          setRoles(rolesFromToken(access));
        }
        if (access && !cancelled) {
          await loadProfile(access);
        }
      } catch {
        await clearSession();
        if (!cancelled) {
          setToken(null);
          setRoles([]);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyToken, loadProfile]);

  const role = primaryRole(
    roles.length ? roles : profile?.role ? [String(profile.role)] : [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      authenticated: Boolean(token),
      token,
      roles,
      role,
      isStaff: isStaffRole(role) || isStaffRole(String(profile?.role || '')),
      profile,
      loadingProfile,
      profileError,
      signIn,
      signOut,
      refreshProfile,
    }),
    [ready, token, roles, role, profile, loadingProfile, profileError, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
