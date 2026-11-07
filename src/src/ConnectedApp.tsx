import { useEffect, useState } from 'react';
import App from './App';
import { hasPendingSaves, loadSnapshot } from './lib/api';
import { authService } from './services/authService';

export default function ConnectedApp() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const connect = async () => {
    setError('');
    try { await authService.initialise(); setReady(true); }
    catch { setError('Could not connect to BEST5. Please check your connection and try again.'); }
  };
  useEffect(() => {
    document.documentElement.dataset.buildVersion = import.meta.env.VITE_GIT_VERSION || 'dev';
    void connect();
  }, []);
  useEffect(() => {
    if (!ready) return;
    const refresh = () => { if (!authService.isAuthenticated() && document.visibilityState === 'visible' && !hasPendingSaves()) void loadSnapshot(authService.isAuthenticated() && !authService.currentUser()?.mustChangePassword).catch(() => {}); };
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener('visibilitychange',refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange',refresh); };
  }, [ready]);
  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-[#07100c] p-6 text-white"><div className="max-w-md space-y-5"><h1 className="display text-3xl">BEST5</h1><p role="status">{error || 'Connecting…'}</p>{error && <button className="btn-primary" onClick={() => void connect()}>Try again</button>}</div></main>;
  return <App/>;
}

