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
