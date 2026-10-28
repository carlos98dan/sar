export type NavGroupId =
  | 'general'
  | 'reservas'
  | 'recursos'
  | 'operacion'
  | 'administracion'
  | 'analisis';

export interface NavGroup {
  id: NavGroupId;
  label: string;
}

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  group: NavGroupId;
}

/** Orden y agrupación del menú. Cada ruta se genera a partir de esta lista en app.routes.ts. */
export const NAV_GROUPS: NavGroup[] = [
  { id: 'general', label: 'General' },
  { id: 'reservas', label: 'Reservas' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'operacion', label: 'Operación' },
  { id: 'administracion', label: 'Administración' },
  { id: 'analisis', label: 'Análisis' },
];

/**
 * Menú consolidado. "Mis reservas" es un filtro dentro de Todas las reservas; las solicitudes
 * y las aprobaciones comparten un módulo; el control de llegadas, salidas y ausencias vive en Control diario.
 */
export const NAV_ITEMS: NavItem[] = [
  { path: '', label: 'Inicio', icon: 'home', group: 'general' },
  { path: 'calendario', label: 'Calendario', icon: 'calendar_today', group: 'general' },
  { path: 'disponibilidad', label: 'Disponibilidad', icon: 'event_available', group: 'general' },

  { path: 'reservas', label: 'Todas las reservas', icon: 'confirmation_number', group: 'reservas' },
  { path: 'solicitudes', label: 'Solicitudes y aprobaciones', icon: 'task_alt', group: 'reservas' },

  { path: 'recursos', label: 'Recursos', icon: 'meeting_room', group: 'recursos' },
  { path: 'categorias-tipos', label: 'Categorías y tipos', icon: 'shapes', group: 'recursos' },
  { path: 'sedes', label: 'Sedes y ubicaciones', icon: 'location_on', group: 'recursos' },

  { path: 'control-diario', label: 'Control diario', icon: 'fact_check', group: 'operacion' },
  { path: 'incidencias', label: 'Incidencias', icon: 'report', group: 'operacion' },
  { path: 'bloqueos', label: 'Bloqueos y cierres', icon: 'block', group: 'operacion' },

  { path: 'horarios', label: 'Horarios y festivos', icon: 'schedule', group: 'administracion' },
  { path: 'reglas', label: 'Reglas y políticas', icon: 'rule', group: 'administracion' },
  { path: 'flujos-aprobacion', label: 'Flujos de aprobación', icon: 'account_tree', group: 'administracion' },
  { path: 'tarifas', label: 'Tarifas', icon: 'payments', group: 'administracion' },
  { path: 'organizacion', label: 'Organización y parámetros', icon: 'apartment', group: 'administracion' },
  { path: 'usuarios', label: 'Usuarios', icon: 'group', group: 'administracion' },
  { path: 'roles', label: 'Roles y permisos', icon: 'admin_panel_settings', group: 'administracion' },
  { path: 'notificaciones', label: 'Notificaciones', icon: 'notifications', group: 'administracion' },

  { path: 'reportes', label: 'Reportes y BI', icon: 'analytics', group: 'analisis' },
  { path: 'auditoria', label: 'Auditoría', icon: 'history', group: 'analisis' },
];
