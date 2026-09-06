/**
 * Constantes globais e de configuração do frontend DOMUS.
 */

// Resolução dinâmica de host para suportar localhost e acesso móvel na rede local (Wi-Fi / LAN)
const getHost = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

export const APP_CONFIG = {
  APP_NAME: 'Domus',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'pt-BR',
  API_BASE_URL: import.meta.env?.VITE_API_URL || `http://${getHost()}:3333/api`,
  SOCKET_URL: import.meta.env?.VITE_SOCKET_URL || `http://${getHost()}:3333`,
};

