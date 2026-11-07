import { api, ApiError, loadSnapshot } from '@/lib/api';
export interface AdminUser { id: string; name: string; email: string; role: string; permissions: string[]; mustChangePassword: boolean; active?: boolean; invitation?: {status:string;emailStatus:string|null;expiresAt:string|null}; }
let user: AdminUser | null = null;
export const authService = {
  currentUser: () => user,
  isAuthenticated: () => Boolean(user),
  can: (permission: string) => Boolean(user?.permissions.includes(permission)),
  async initialise() {
    try { user = await api<AdminUser>('/auth/me'); }
    catch (error) { if (!(error instanceof ApiError) || error.status !== 401) throw error; user = null; }
    await loadSnapshot(Boolean(user && !user.mustChangePassword));
  },
  async login(identity: string, password: string, remember: boolean) {
    try { user = await api<AdminUser>('/auth/login', { method: 'POST', body: JSON.stringify({ email: identity.trim(), password, remember }) }); }
    catch (error) { if (error instanceof ApiError && error.status === 401) return false; throw error; }
    await loadSnapshot(!user.mustChangePassword);
    return true;
  },
  async changePassword(currentPassword: string, newPassword: string) {
    user = await api<AdminUser>('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
    await loadSnapshot(true);
  },
  async logout() {
    try { await api('/auth/logout', { method: 'POST', body: '{}' }); }
    catch (error) { if (!(error instanceof ApiError) || error.status !== 401) throw error; }
    user = null;
    await loadSnapshot(false);
  },
  async expire() { user = null; await loadSnapshot(false); },
};
