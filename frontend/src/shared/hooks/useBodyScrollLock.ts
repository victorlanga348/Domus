import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

/**
 * Trava a rolagem do body quando um modal/popup estiver aberto,
 * evitando que o fundo da página se mova enquanto o usuário interage com o modal.
 * Suporta múltiplos modais abertos simultaneamente (contador de locks).
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;

      // Compensação da largura da scrollbar no desktop para evitar layout shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }

    lockCount++;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.touchAction = '';
      }
    };
  }, [isLocked]);
}
