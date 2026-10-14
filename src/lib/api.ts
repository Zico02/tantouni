import type { Achievement, BlockedDay, DayAvailability, Fish, Reservation } from './types';

const TOKEN_KEY = 'tantoni-admin-token';

export const adminToken = {
  get: () => {
    try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
  },
  set: (t: string) => {
    try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* private mode */ }
  },
  clear: () => {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
  }
}

async function request<T>(url: string, init: RequestInit = {}, admin = false): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (init.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (admin) headers.Authorization = `Bearer ${adminToken.get()}`;
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401 && admin) adminToken.clear();
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || 'error');
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  config: () => request<{ price: number; boats: number; seatsPerBoat: number; today: string }>('/api/config'),
  availability: (from: string, to: string) =>
    request<{ today: string; firstBookable: string; days: Record<string, DayAvailability> }>(`/api/availability?from=${from}&to=${to}`),
  reserve: (body: { name: string; phone: string; email: string; message: string; date: string; people: number; lang: string }) =>
    request<{ ref: string; date: string; people: number; total: number; allocation: { boat: number; seats: number }[] }>(
      '/api/reservations', { method: 'POST', body: json(body) }),
  fish: () => request<Fish[]>('/api/fish'),
  achievements: () => request<Achievement[]>('/api/achievements'),
  createAchievement: (a: Partial<Achievement>) => request<Achievement>('/api/admin/achievements', { method: 'POST', body: json(a) }, true),
  updateAchievement: (id: string, a: Partial<Achievement>) =>
    request<Achievement>(`/api/admin/achievements/${id}`, { method: 'PUT', body: json(a) }, true),
  deleteAchievement: (id: string) => request<void>(`/api/admin/achievements/${id}`, { method: 'DELETE' }, true),

  login: (password: string) => request<{ token: string }>('/api/admin/login', { method: 'POST', body: json({ password }) }),
  reservations: () => request<Reservation[]>('/api/admin/reservations', {}, true),
  createReservation: (body: { name: string; phone: string; email: string; message: string; date: string; people: number; status: Reservation['status'] }) =>
    request<Reservation>('/api/admin/reservations', { method: 'POST', body: json(body) }, true),
  updateReservation: (id: string, patch: Partial<Pick<Reservation, 'status' | 'adminNotes'>>) =>
    request<Reservation>(`/api/admin/reservations/${id}`, { method: 'PATCH', body: json(patch) }, true),
  deleteReservation: (id: string) => request<void>(`/api/admin/reservations/${id}`, { method: 'DELETE' }, true),
  blocked: () => request<BlockedDay[]>('/api/admin/blocked', {}, true),
  block: (date: string, reason: string, type: 'blocked' | 'weather' = 'blocked') =>
    request<{ date: string; affected: number }>('/api/admin/blocked', { method: 'POST', body: json({ date, reason, type }) }, true),
  unblock: (date: string) => request<void>(`/api/admin/blocked/${date}`, { method: 'DELETE' }, true),
  createFish: (fish: Partial<Fish>) => request<Fish>('/api/admin/fish', { method: 'POST', body: json(fish) }, true),
  updateFish: (id: string, fish: Partial<Fish>) =>
    request<Fish>(`/api/admin/fish/${id}`, { method: 'PUT', body: json(fish) }, true),
  deleteFish: (id: string) => request<void>(`/api/admin/fish/${id}`, { method: 'DELETE' }, true),
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return request<{ url: string }>('/api/admin/upload', { method: 'POST', body: fd }, true);
  },
};
