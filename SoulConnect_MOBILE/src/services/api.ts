import {API_URL, KEYCLOAK_CLIENT_ID, keycloakBase} from '../config/env';

export interface ApiResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

export async function request<T = any>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
  } = {},
): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body != null ? JSON.stringify(options.body) : undefined,
    });
    const data = (await response.json().catch(() => ({}))) as T & {
      error?: string;
      message?: string;
      detail?: string;
    };
    if (!response.ok || data?.error) {
      return {
        ok: false,
        status: response.status,
        data,
        error:
          data?.error ||
          data?.message ||
          data?.detail ||
          `Request failed (${response.status})`,
      };
    }
    return {ok: true, status: response.status, data};
  } catch (error: any) {
    return {
      ok: false,
      status: 0,
      data: {} as T,
      error: error?.message || 'Network error',
    };
  }
}

export async function savePublicCustomer(data: Record<string, unknown>) {
  return request('/api/public/customer_create', {
    method: 'POST',
    body: {
      ...data,
      whoiam_register: data.whoiam_register || data.profile_created_for || 'For myself',
      profile_created_for: data.profile_created_for || data.whoiam_register || 'For myself',
    },
  });
}

export async function sendOtp(payload: {
  email?: string;
  type: 'email' | 'phone';
  phone_number?: string;
  phone_code?: string;
}) {
  return request('/api/public/verification/send-otp', {method: 'POST', body: payload});
}

export async function verifyOtp(payload: {
  email?: string;
  type: 'email' | 'phone';
  otp: string;
  phone_number?: string;
}) {
  return request('/api/public/verification/verify-otp', {method: 'POST', body: payload});
}

export async function fetchSubscriptions(token?: string | null) {
  const path = token ? '/api/subscriptions' : '/api/public/subscriptions';
  const result = await request<any>(path, {token});
  const list = Array.isArray(result.data) ? result.data : result.data?.data || [];
  return {...result, list: Array.isArray(list) ? list : []};
}

export async function fetchProfile(token: string, keycloakId?: string, email?: string) {
  return request('/api/profile_detail', {
    method: 'POST',
    token,
    body: {keycloakId, email},
  });
}

export async function fetchCustomerList(
  token: string,
  body: {
    customer_type: boolean;
    skip: number;
    limit: number;
    filters: Record<string, string>;
  },
) {
  return request<{data?: any[]; total?: number}>('/api/customer_list', {
    method: 'POST',
    token,
    body,
  });
}

export async function fetchCustomerDetail(token: string, id: string) {
  return request(`/api/customer_detail/${id}`, {token});
}

export async function fetchInterested(token: string, payload: Record<string, unknown>) {
  const authed = await request('/api/interested_list', {
    method: 'POST',
    token,
    body: payload,
  });
  if (authed.ok) {
    return authed;
  }
  return request('/api/public/interested_list', {method: 'POST', body: payload});
}

export async function sendInterest(token: string, payload: Record<string, unknown>) {
  const primary = await request('/api/send_interest', {
    method: 'POST',
    token,
    body: payload,
  });
  if (primary.ok) {
    return primary;
  }
  return request('/api/customer_edit', {
    method: 'POST',
    token,
    body: {
      id: payload.target_customer_id,
      customer_id: payload.target_customer_id,
      isInterested: payload.isInterested,
    },
  });
}

export async function fetchDashboard(token?: string | null) {
  const path = token ? '/api/dashboard_analytics' : '/api/public/dashboard_analytics';
  return request(path, {token});
}

export async function fetchTransactions(token: string, body: Record<string, unknown>) {
  return request('/api/transactions_list', {method: 'POST', token, body});
}

export async function fetchPaymentAccounts(token: string, body: Record<string, unknown>) {
  return request('/api/payment_account_list', {method: 'POST', token, body});
}

export async function exchangeAuthCode(code: string, verifier: string, redirectUri: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KEYCLOAK_CLIENT_ID,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });
  const response = await fetch(`${keycloakBase}/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: body.toString(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.error || 'Sign-in failed');
  }
  return data as {access_token: string; refresh_token: string; id_token?: string};
}

export async function refreshAuthToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: KEYCLOAK_CLIENT_ID,
    refresh_token: refreshToken,
  });
  const response = await fetch(`${keycloakBase}/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: body.toString(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || 'Session expired');
  }
  return data as {access_token: string; refresh_token?: string; id_token?: string};
}

export function buildAuthorizeUrl(challenge: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return `${keycloakBase}/auth?${params.toString()}`;
}

export function approvalStatus(item: any): string {
  if (item?.public_verify === true || item?.approvalStatus === 'Approved') {
    return 'Approved';
  }
  if (
    item?.approvalStatus === 'Rejected' ||
    String(item?.public_verify_command_helper || '').toLowerCase().includes('reject')
  ) {
    return 'Rejected';
  }
  return item?.approvalStatus || 'Wait for approval';
}

export function displayName(person: any): string {
  const name = `${person?.first_name || person?.firstName || ''} ${
    person?.last_name || person?.lastName || ''
  }`.trim();
  return name || person?.email || person?.name || 'Member';
}

export function photoUrl(person: any): string | null {
  const image = person?.image;
  if (Array.isArray(image) && image.length > 0) {
    const first = image[0];
    return typeof first === 'string' ? first : first?.url || null;
  }
  return null;
}

export function oppositeGender(gender?: string): string {
  const value = (gender || '').toLowerCase();
  if (value === '' || value === 'male' || value === 'maile') {
    return 'female';
  }
  return 'male';
}

export interface PlanCard {
  id: string;
  name: string;
  price: string;
  sub: string;
  features: string[];
  isPopular: boolean;
}

const STATIC_PLANS: PlanCard[] = [
  {
    id: 'free',
    name: 'Free Entry',
    price: '₹0',
    sub: 'Basic listing and search access',
    isPopular: false,
    features: [
      'Create profile (Tamil and English)',
      'Basic district filters',
      'Aadhaar verification request',
      'Receive match suggestions',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Match',
    price: '₹2,499',
    sub: '3 months validity',
    isPopular: true,
    features: [
      'View direct contact details',
      'Unlimited candidate views',
      'Psychology compatibility index',
      'Highlight profile in searches',
    ],
  },
  {
    id: 'elite',
    name: 'Elite Circle',
    price: '₹4,999',
    sub: '6 months validity',
    isPopular: false,
    features: [
      'All Premium features',
      'Dedicated relationship manager',
      '1 free counselling session',
      'Featured badge',
    ],
  },
  {
    id: 'gold',
    name: 'Gold VIP',
    price: '₹9,999',
    sub: '12 months validity',
    isPopular: false,
    features: [
      'Dedicated relationship manager',
      'Family-to-family meetings',
      'Background verification audit',
      'Unlimited counselling reviews',
    ],
  },
];

export function mapPlans(subscriptions: any[]): PlanCard[] {
  const active = subscriptions
    .filter(sub => sub && sub.active !== false && sub.status !== 'inactive')
    .sort((a, b) => {
      const priceA = Number(String(a.price || 0).replace(/[^0-9.]/g, '')) || 0;
      const priceB = Number(String(b.price || 0).replace(/[^0-9.]/g, '')) || 0;
      return priceA - priceB;
    });
  if (active.length === 0) {
    return STATIC_PLANS;
  }
  return active.map((sub, index) => {
    const rawFeatures = sub.feature || sub.features || [];
    const features = Array.isArray(rawFeatures)
      ? rawFeatures.map((feature: any) =>
          typeof feature === 'object'
            ? feature.value || feature.name || feature.title || ''
            : String(feature),
        )
      : [];
    const formattedPrice =
      sub.price !== undefined && sub.price !== null
        ? `${sub.currency_type || '₹'}${
            typeof sub.price === 'number' ? sub.price.toLocaleString('en-IN') : sub.price
          }`
        : '₹0';
    return {
      id: String(sub._id || sub.id || sub.type || `plan-${index}`),
      name: sub.name || sub.type || 'Subscription Plan',
      price: formattedPrice,
      sub: sub.description || sub.sub || 'Membership plan',
      features: features.filter(Boolean).length
        ? features
        : STATIC_PLANS[index % STATIC_PLANS.length].features,
      isPopular: Boolean(sub.most_popluar || sub.most_popular || sub.isPopular),
    };
  });
}

export function isFreePrice(price: string): boolean {
  const amount = Number(String(price).replace(/[^0-9.]/g, ''));
  return !price || price === '₹0' || amount === 0;
}
