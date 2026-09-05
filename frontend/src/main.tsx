import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import './index.css';

// Script de Auditoria Imediata de Layout Mobile e Overflow
if (typeof window !== 'undefined') {
  (window as any).__auditMobileOverflow = () => {
    const docWidth = document.documentElement.offsetWidth;
    const overflowingElements: HTMLElement[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.offsetWidth > docWidth) {
        overflowingElements.push(htmlEl);
        console.warn('Elemento causando overflow:', htmlEl);
      }
    });
    if (overflowingElements.length === 0) {
      console.log('✅ Nenhum elemento causando overflow horizontal na viewport.');
    }
    return overflowingElements;
  };
}

// Registro do Service Worker para suporte a PWA (App Shell em produção)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.PROD || localStorage.getItem('domus_enable_sw_dev') === 'true') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[DOMUS PWA] Service Worker registrado com sucesso no escopo:', registration.scope);
        })
        .catch((error) => {
          console.warn('[DOMUS PWA] Falha ao registrar Service Worker:', error);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

