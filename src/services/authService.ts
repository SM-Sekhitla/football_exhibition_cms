const SESSION_KEY = 'best5_admin_session';

export const authService = {
  isAuthenticated: () => Boolean(localStorage.getItem(SESSION_KEY)),
  async login(identity: string, password: string, remember: boolean) {
    await new Promise(resolve => window.setTimeout(resolve, 450));
    if (identity.trim().toLowerCase() !== 'admin@best5.co.za' || password !== 'Best5Admin2026') return false;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ identity, remember, signedInAt: new Date().toISOString() }));
    return true;
  },
  logout() { localStorage.removeItem(SESSION_KEY); },
};
