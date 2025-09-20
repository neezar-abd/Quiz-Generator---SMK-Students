export type ApiSuccess<T> = { ok: true; data: T; message?: string };
export type ApiFailure = { ok: false; error: string; details?: unknown };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, message?: string): ApiSuccess<T> {
  return { ok: true, data, message };
}

export function fail(error: string, details?: unknown): ApiFailure {
  return { ok: false, error, details };
}

export async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}
