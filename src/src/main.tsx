import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ToastViewport } from './components/shared/Toast.tsx';
import { ConfirmViewport } from './components/shared/Confirm.tsx';

import ConnectedApp from './ConnectedApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConnectedApp />
    <ToastViewport />
    <ConfirmViewport />
  </StrictMode>
);

// Keep local development free of production service-worker caching.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
      // A failed installation must not prevent normal website use.
    });
  });
}
