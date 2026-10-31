import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageKeys = {
  accessToken: 'token',
  refreshToken: 'refresh_token',
  idToken: 'id_token',
  loggedIn: 'logged_in',
  roles: 'roles',
  pendingRegistration: 'pending_customer_registration',
  pendingPlan: 'pending_selected_plan',
  registrationData: 'registration_data',
  interestedIds: 'interested_profile_ids',
} as const;

export async function storageGet(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function storageSet(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function storageRemove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function storageGetJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function storageSetJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeMany([
    storageKeys.accessToken,
    storageKeys.refreshToken,
    storageKeys.idToken,
    storageKeys.loggedIn,
    storageKeys.roles,
  ]);
}
