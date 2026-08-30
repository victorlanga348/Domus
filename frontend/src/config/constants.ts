/**
 * Constantes globais e de configuração do frontend DOMUS.
 */
export const APP_CONFIG = {
  APP_NAME: 'DOMUS',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'pt-BR',
  API_BASE_URL: import.meta.env?.VITE_API_URL || 'http://localhost:3333/api',
  SOCKET_URL: import.meta.env?.VITE_SOCKET_URL || 'http://localhost:3333',
};
