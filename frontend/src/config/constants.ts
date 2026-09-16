/**
 * Constantes globais e de configuração do frontend DOMUS.
 */

const PRODUCTION_BACKEND_URL = 'https://domus-api.duckdns.org:3333';

const isLocalOrLanHost = (hostname: string): boolean => {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    /^192\.168\.\d+\.\d+$/.test(hostname) ||
    /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname)
  );
};

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const hostname = window.location.hostname;
    if (isLocalOrLanHost(hostname)) {
      const normalizedHost = hostname === 'localhost' || hostname === '::1' ? '127.0.0.1' : hostname;
      return `http://${normalizedHost}:3333`;
    }
  }
  return PRODUCTION_BACKEND_URL;
};

export const APP_CONFIG = {
  APP_NAME: 'Domus',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'pt-BR',
  API_BASE_URL: import.meta.env?.VITE_API_URL || `${getBaseUrl()}/api`,
  SOCKET_URL: import.meta.env?.VITE_SOCKET_URL || getBaseUrl(),
};

