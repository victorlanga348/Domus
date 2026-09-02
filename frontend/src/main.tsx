import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

