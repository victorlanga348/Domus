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

// Desregistro e limpeza preventiva de Service Worker e Caches residuais
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
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

