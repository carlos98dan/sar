import { BookingRule } from '../utils/rules';
import { CustomFieldDef } from './custom-field';

/**
 * Parametrización por categoría: campos adicionales y si requiere aprobación.
 * BACKEND: estas configuraciones vendrán de la API de parametrización de la organización.
 */
export interface CategoryConfig {
  requiresApproval: boolean;
  fields: CustomFieldDef[];
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'Salas de reuniones': {
    requiresApproval: false,
    fields: [
      {
        key: 'equipamiento',
        label: 'Equipamiento requerido',
        type: 'select',
        options: ['Ninguno', 'Videobeam', 'Tablero digital', 'Videoconferencia'],
      },
    ],
  },
  'Auditorios y eventos': {
    requiresApproval: true,
    fields: [
      {
        key: 'distribucion',
        label: 'Distribución',
        type: 'select',
        options: ['Auditorio', 'Escuela', 'Mesa redonda'],
        required: true,
      },
      { key: 'audiovisual', label: 'Necesidades audiovisuales', type: 'text' },
    ],
  },
  'Canchas deportivas': {
    requiresApproval: false,
    fields: [
      {
        key: 'modalidad',
        label: 'Modalidad deportiva',
        type: 'select',
        options: ['Fútbol 5', 'Fútbol 7', 'Tenis', 'Baloncesto'],
        required: true,
      },
      { key: 'jugadores', label: 'Número de jugadores', type: 'number', required: true },
    ],
  },
  'Equipos audiovisuales': {
    requiresApproval: false,
    fields: [{ key: 'cantidad', label: 'Cantidad de equipos', type: 'number', required: true }],
  },
  Vehículos: {
    requiresApproval: true,
    fields: [
      { key: 'conductor', label: 'Conductor autorizado', type: 'text', required: true },
      { key: 'destino', label: 'Destino', type: 'text', required: true },
    ],
  },
};

export function configFor(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category] ?? { requiresApproval: true, fields: [] };
}

/** Tarifa de referencia por hora, en COP, por recurso. */
export const HOURLY_RATES: Record<string, number> = {
  'res-sala-101': 25000,
  'res-junta-ejecutiva': 40000,
  'res-auditorio': 180000,
  'res-cancha-futbol5': 60000,
  'res-cancha-tenis': 35000,
  'res-proyector': 5000,
  'res-vehiculo-adm': 20000,
};

/** Reglas de reserva iniciales de demostración. */
export const DEFAULT_RULES: BookingRule[] = [
  {
    id: 'rule-1',
    name: 'Anticipación mínima',
    kind: 'advance_min',
    value: 2,
    category: null,
    active: true,
  },
  {
    id: 'rule-2',
    name: 'Anticipación máxima',
    kind: 'advance_max',
    value: 720,
    category: null,
    active: true,
  },
  {
    id: 'rule-3',
    name: 'Duración mínima',
    kind: 'duration_min',
    value: 30,
    category: null,
    active: true,
  },
  {
    id: 'rule-4',
    name: 'Duración máxima en salas',
    kind: 'duration_max',
    value: 240,
    category: 'Salas de reuniones',
    active: true,
  },
  {
    id: 'rule-5',
    name: 'Duración máxima en canchas',
    kind: 'duration_max',
    value: 120,
    category: 'Canchas deportivas',
    active: false,
  },
];

export interface SiteSchedule {
  site: string;
  days: string;
  opens: string;
  closes: string;
}

export const SITE_SCHEDULES: SiteSchedule[] = [
  { site: 'Sede Principal', days: 'Lunes a viernes', opens: '07:00', closes: '21:00' },
  { site: 'Sede Deportiva', days: 'Lunes a domingo', opens: '06:00', closes: '22:00' },
  { site: 'Centro de Capacitación', days: 'Lunes a sábado', opens: '08:00', closes: '18:00' },
];

export interface Holiday {
  date: string;
  name: string;
}

/** Festivos de demostración. BACKEND: calendario oficial de festivos de la organización. */
export const HOLIDAYS: Holiday[] = [
  { date: '2026-10-12', name: 'Día de la Raza' },
  { date: '2026-11-16', name: 'Independencia de Cartagena' },
  { date: '2026-12-08', name: 'Inmaculada Concepción' },
];
