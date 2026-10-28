export type RuleKind = 'advance_min' | 'advance_max' | 'duration_min' | 'duration_max';

export interface BookingRule {
  id: string;
  name: string;
  kind: RuleKind;
  /** Horas para anticipación, minutos para duración. */
  value: number;
  /** Categoría a la que aplica, o `null` para todas. */
  category: string | null;
  active: boolean;
}

export interface RuleRequest {
  category: string;
  /** Horas entre el momento de la solicitud y el inicio de la reserva. */
  anticipationHours: number;
  durationMinutes: number;
}

const MESSAGES: Record<RuleKind, (value: number) => string> = {
  advance_min: (value) => `Debe reservarse con al menos ${value} horas de anticipación`,
  advance_max: (value) => `No se puede reservar con más de ${value} horas de anticipación`,
  duration_min: (value) => `La duración mínima es de ${value} minutos`,
  duration_max: (value) => `La duración máxima es de ${value} minutos`,
};

/** Reglas activas que incumple la solicitud. Una lista vacía significa que la solicitud cumple. */
export function ruleViolations(rules: BookingRule[], request: RuleRequest): string[] {
  return rules
    .filter((rule) => rule.active && (rule.category === null || rule.category === request.category))
    .filter((rule) => {
      switch (rule.kind) {
        case 'advance_min':
          return request.anticipationHours < rule.value;
        case 'advance_max':
          return request.anticipationHours > rule.value;
        case 'duration_min':
          return request.durationMinutes < rule.value;
        case 'duration_max':
          return request.durationMinutes > rule.value;
      }
    })
    .map((rule) => `${rule.name}: ${MESSAGES[rule.kind](rule.value)}`);
}
