import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

type Shift = 'MORNING' | 'AFTERNOON' | 'NIGHT';

/**
 * Função de determinação de turno com injeção de hora para teste determinístico
 */
function getShiftForHour(hour: number): Shift {
  if (hour >= 6 && hour < 12) return 'MORNING';
  if (hour >= 12 && hour < 18) return 'AFTERNOON';
  return 'NIGHT';
}

describe('DashboardService (Cálculo Determinístico de Turnos)', () => {
  it('deve classificar corretamente o turno da MANHÃ (06:00 às 11:59)', () => {
    assert.equal(getShiftForHour(6), 'MORNING');
    assert.equal(getShiftForHour(9), 'MORNING');
    assert.equal(getShiftForHour(11), 'MORNING');
  });

  it('deve classificar corretamente o turno da TARDE (12:00 às 17:59)', () => {
    assert.equal(getShiftForHour(12), 'AFTERNOON');
    assert.equal(getShiftForHour(15), 'AFTERNOON');
    assert.equal(getShiftForHour(17), 'AFTERNOON');
  });

  it('deve classificar corretamente o turno da NOITE (18:00 às 05:59)', () => {
    assert.equal(getShiftForHour(18), 'NIGHT');
    assert.equal(getShiftForHour(22), 'NIGHT');
    assert.equal(getShiftForHour(0), 'NIGHT');
    assert.equal(getShiftForHour(3), 'NIGHT');
    assert.equal(getShiftForHour(5), 'NIGHT');
  });
});
