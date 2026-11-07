export const API_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');
export interface Snapshot { data: Record<string, unknown>; revisions: Record<string, number>; }
const cache: Record<string, unknown> = {};
let revisions: Record<string, number> = {};
let queue: Promise<unknown> = Promise.resolve();
let pending = 0;

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const csrf = document.cookie.split('; ').find(x => x.startsWith('best5_csrf='))?.split('=')[1] || '';
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': decodeURIComponent(csrf), ...options.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('best5:session-expired'));
    throw new ApiError(response.status, typeof body.detail === 'string' ? body.detail : 'The request failed. Please try again.');
  }
  return response.json() as Promise<T>;
}
export function readCache<T>(key: string, fallback: T): T { return (cache[key] ?? fallback) as T; }
export function applySnapshot(snapshot: Snapshot) {
  for (const key of Object.keys(cache)) delete cache[key];
  Object.assign(cache, snapshot.data);
  revisions = snapshot.revisions;
  window.dispatchEvent(new Event('best5:data'));
  window.dispatchEvent(new Event('best5:landing'));
}
export async function loadSnapshot(admin = false) { applySnapshot(await api<Snapshot>(admin ? '/admin/bootstrap' : '/public/bootstrap')); }
export function saveResource<T>(key: string, value: T): Promise<T> {
  // Serialise writes and retain the revision of the data the user actually edited.
  const submitted = structuredClone(value);
  const submittedRevision = revisions[key] ?? 0;
  pending++;
  window.dispatchEvent(new Event('best5:saving'));
  const task = queue.catch(() => {}).then(async () => {
    const snapshot = await api<Snapshot>(`/admin/content/${key}`, { method: 'PUT', body: JSON.stringify({ value: submitted, revision: submittedRevision }) });
    applySnapshot(snapshot);
    return readCache(key, submitted);
  });
  queue = task.finally(() => { pending--; window.dispatchEvent(new Event('best5:saving')); });
  // The returned task carries errors to the caller; avoid an unhandled queue rejection.
  void queue.catch(() => {});
  return task;
}
export function hasPendingSaves() { return pending > 0; }
window.addEventListener('beforeunload', e => { if (pending) { e.preventDefault(); e.returnValue = ''; } });

export interface UploadPolicy { proof: { maxSizeBytes: number; types: string[] }; image: { maxSizeBytes: number; types: string[] }; }
export function uploadPolicy() {
  return readCache<UploadPolicy>('uploadPolicy', {
    proof: { maxSizeBytes: 2 * 1024 * 1024, types: ['application/pdf','image/jpeg','image/png'] },
    image: { maxSizeBytes: 20 * 1024 * 1024, types: ['image/jpeg','image/png','image/webp','image/gif','image/avif'] },
  });
}
