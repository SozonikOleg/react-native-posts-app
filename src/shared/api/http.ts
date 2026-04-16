type ApiError = {
  ok: false;
  error?: { code?: string; message?: string };
};

function getRequiredEnv(name: 'EXPO_PUBLIC_API_BASE_URL' | 'EXPO_PUBLIC_AUTH_UUID') {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Set it in .env and restart Expo.`);
  }
  return value;
}

function getBaseUrl() {
  const raw = getRequiredEnv('EXPO_PUBLIC_API_BASE_URL');

  if (raw.endsWith('/openapi.json')) {
    return raw.replace(/\/openapi\.json$/, '');
  }

  return raw;
}

function getAuthHeader() {
  const uuid = getRequiredEnv('EXPO_PUBLIC_AUTH_UUID');
  return { Authorization: `Bearer ${uuid}` };
}

function buildApiUrl(path: string) {
  const baseWithSlash = `${getBaseUrl().replace(/\/+$/, '')}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  return new URL(normalizedPath, baseWithSlash);
}

export async function apiGetJson<T>(path: string, params?: Record<string, any>) {
  const url = buildApiUrl(path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
  });

  const json = (await res.json().catch(() => null)) as (T & ApiError) | null;
  if (!res.ok || !json || (json as any).ok === false) {
    const code = (json as any)?.error?.code;
    const message =
      (json as any)?.error?.message ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(
      `${code ? `[${String(code)}] ` : ''}${message} (${url.toString()})`,
    );
  }
  return json as T;
}

export async function apiPostJson<T>(
  path: string,
  body?: unknown,
  params?: Record<string, any>,
) {
  const url = buildApiUrl(path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const json = (await res.json().catch(() => null)) as (T & ApiError) | null;
  if (!res.ok || !json || (json as any).ok === false) {
    const code = (json as any)?.error?.code;
    const message =
      (json as any)?.error?.message ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(
      `${code ? `[${String(code)}] ` : ''}${message} (${url.toString()})`,
    );
  }
  return json as T;
}

