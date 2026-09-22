import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastViewport } from './components/shared/Toast.tsx';
import { ConfirmViewport } from './components/shared/Confirm.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastViewport />
    <ConfirmViewport />
  </StrictMode>
);
