/**
 * Utilitários compartilhados do backend DOMUS.
 */
export function isLockExpired(lockedAt: Date | string | null, timeoutMinutes = 45): boolean {
  if (!lockedAt) return true;
  const lockedTime = new Date(lockedAt).getTime();
  const diffMs = Date.now() - lockedTime;
  return diffMs > timeoutMinutes * 60 * 1000;
}
