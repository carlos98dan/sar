import { BookingRule, ruleViolations } from './rules';

const RULES: BookingRule[] = [
  {
    id: 'r1',
    name: 'Anticipación mínima',
    kind: 'advance_min',
    value: 2,
    category: null,
    active: true,
  },
  {
    id: 'r2',
    name: 'Duración máxima en salas',
    kind: 'duration_max',
    value: 240,
    category: 'Salas de reuniones',
    active: true,
  },
  {
    id: 'r3',
    name: 'Regla inactiva',
    kind: 'duration_min',
    value: 600,
    category: null,
    active: false,
  },
];

describe('ruleViolations', () => {
  it('no reporta incumplimientos cuando la solicitud cumple', () => {
    expect(
      ruleViolations(RULES, {
        category: 'Salas de reuniones',
        anticipationHours: 24,
        durationMinutes: 60,
      }),
    ).toEqual([]);
  });

  it('reporta anticipación insuficiente', () => {
    const result = ruleViolations(RULES, {
      category: 'Canchas deportivas',
      anticipationHours: 1,
      durationMinutes: 60,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('Anticipación mínima');
  });

  it('aplica reglas solo a su categoría', () => {
    expect(
      ruleViolations(RULES, {
        category: 'Canchas deportivas',
        anticipationHours: 24,
        durationMinutes: 300,
      }),
    ).toEqual([]);
  });

  it('ignora reglas inactivas', () => {
    expect(
      ruleViolations(RULES, {
        category: 'Salas de reuniones',
        anticipationHours: 24,
        durationMinutes: 30,
      }),
    ).toEqual([]);
  });
});
