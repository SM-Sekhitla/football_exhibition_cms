import { useEffect, useState } from 'react';
import App from './App';
import OpeningLoader from './components/shared/OpeningLoader';
import { hasPendingSaves, loadSnapshot } from './lib/api';
import { authService } from './services/authService';

export default function ConnectedApp() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [introDone, setIntroDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setIntroDone(true), reduced ? 0 : 900);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready || !introDone) return;
    const timer = window.setTimeout(() => setRevealed(true), 300);
    return () => window.clearTimeout(timer);
  }, [ready, introDone]);
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
  if (!revealed) return <OpeningLoader error={error} leaving={ready && introDone} onRetry={() => void connect()}/>;
  return <div className="site-arrival"><App/></div>;
}
