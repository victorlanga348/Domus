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

// Registro formal do Service Worker PWA para Android/Chrome
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[Domus PWA] Service Worker ativo:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Domus PWA] Erro ao registrar Service Worker:', err);
      });
  });
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

