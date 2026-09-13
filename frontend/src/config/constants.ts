/**
 * Constantes globais e de configuração do frontend DOMUS.
 */

// Resolução dinâmica de host: normaliza localhost/::1 para 127.0.0.1 (evita timeout IPv6 no Windows/Docker) e suporta acesso móvel na LAN
const getHost = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '::1') {
      return '127.0.0.1';
    }
    return hostname;
  }
  return '127.0.0.1';
};

export const APP_CONFIG = {
  APP_NAME: 'Domus',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'pt-BR',
  API_BASE_URL: import.meta.env?.VITE_API_URL || `http://${getHost()}:3333/api`,
  SOCKET_URL: import.meta.env?.VITE_SOCKET_URL || `http://${getHost()}:3333`,
};

