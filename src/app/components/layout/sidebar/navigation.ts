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

export const NAV_ITEMS: NavItem[] = [
  { path: '', label: 'Inicio', icon: 'home', group: 'general' },
  { path: 'calendario', label: 'Calendario', icon: 'calendar_today', group: 'general' },
  { path: 'disponibilidad', label: 'Disponibilidad', icon: 'event_available', group: 'general' },

  { path: 'reservas', label: 'Todas las reservas', icon: 'confirmation_number', group: 'reservas' },
  { path: 'mis-reservas', label: 'Mis reservas', icon: 'bookmark', group: 'reservas' },
  { path: 'solicitudes', label: 'Solicitudes', icon: 'inbox', group: 'reservas' },
  { path: 'aprobaciones', label: 'Aprobaciones', icon: 'task_alt', group: 'reservas' },

  { path: 'recursos', label: 'Recursos (inventario)', icon: 'meeting_room', group: 'recursos' },
  { path: 'categorias', label: 'Categorías', icon: 'category', group: 'recursos' },
  { path: 'tipos-recurso', label: 'Tipos de recurso', icon: 'shapes', group: 'recursos' },
  { path: 'sedes', label: 'Sedes y ubicaciones', icon: 'location_on', group: 'recursos' },

  { path: 'control-diario', label: 'Control diario', icon: 'fact_check', group: 'operacion' },
  { path: 'check-in-out', label: 'Check-in / Check-out', icon: 'how_to_reg', group: 'operacion' },
  { path: 'no-asistencia', label: 'No asistencia', icon: 'person_off', group: 'operacion' },
  { path: 'bloqueos', label: 'Bloqueos', icon: 'block', group: 'operacion' },
  { path: 'mantenimiento', label: 'Mantenimiento', icon: 'build', group: 'operacion' },
  { path: 'incidencias', label: 'Incidencias', icon: 'report', group: 'operacion' },

  { path: 'horarios', label: 'Horarios', icon: 'schedule', group: 'administracion' },
  { path: 'festivos', label: 'Festivos y excepciones', icon: 'event_busy', group: 'administracion' },
  { path: 'reglas', label: 'Reglas de reserva', icon: 'rule', group: 'administracion' },
  { path: 'politicas-cancelacion', label: 'Políticas de cancelación', icon: 'policy', group: 'administracion' },
  { path: 'flujos-aprobacion', label: 'Flujos de aprobación', icon: 'account_tree', group: 'administracion' },
  { path: 'campos-dinamicos', label: 'Campos dinámicos', icon: 'dynamic_form', group: 'administracion' },
  { path: 'organizacion', label: 'Organización', icon: 'apartment', group: 'administracion' },
  { path: 'usuarios', label: 'Usuarios', icon: 'group', group: 'administracion' },
  { path: 'roles', label: 'Roles y permisos', icon: 'admin_panel_settings', group: 'administracion' },
  { path: 'notificaciones', label: 'Notificaciones', icon: 'notifications', group: 'administracion' },
  { path: 'parametros', label: 'Parámetros generales', icon: 'tune', group: 'administracion' },

  { path: 'reportes', label: 'Reportes y BI', icon: 'analytics', group: 'analisis' },
  { path: 'auditoria', label: 'Auditoría', icon: 'history', group: 'analisis' },
];
