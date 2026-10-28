import { PermissionDef, PermissionId } from '../models/permission.model';
import { UserRole } from '../models/user.model';

export const PERMISSIONS: PermissionDef[] = [
  { id: 'reservas.ver', module: 'Reservas', label: 'Ver reservas' },
  { id: 'reservas.crear', module: 'Reservas', label: 'Crear reservas' },
  { id: 'reservas.aprobar', module: 'Reservas', label: 'Aprobar o rechazar solicitudes' },
  { id: 'reservas.cancelar', module: 'Reservas', label: 'Cancelar reservas' },
  {
    id: 'control.registrar',
    module: 'Operación',
    label: 'Registrar llegadas, salidas y ausencias',
  },
  { id: 'recursos.gestionar', module: 'Recursos', label: 'Gestionar recursos, categorías y tipos' },
  { id: 'sedes.gestionar', module: 'Recursos', label: 'Gestionar sedes y ubicaciones' },
  { id: 'bloqueos.gestionar', module: 'Operación', label: 'Crear bloqueos y cierres' },
  { id: 'incidencias.gestionar', module: 'Operación', label: 'Registrar y resolver incidencias' },
  { id: 'reglas.gestionar', module: 'Administración', label: 'Gestionar reglas y políticas' },
  { id: 'tarifas.gestionar', module: 'Administración', label: 'Gestionar tarifas' },
  { id: 'flujos.gestionar', module: 'Administración', label: 'Gestionar flujos de aprobación' },
  {
    id: 'organizacion.gestionar',
    module: 'Administración',
    label: 'Editar organización y parámetros',
  },
  { id: 'usuarios.gestionar', module: 'Administración', label: 'Gestionar usuarios' },
  { id: 'roles.gestionar', module: 'Administración', label: 'Gestionar roles y permisos' },
  { id: 'reportes.ver', module: 'Análisis', label: 'Ver reportes y BI' },
  { id: 'auditoria.ver', module: 'Análisis', label: 'Ver auditoría' },
];

const ALL_PERMISSIONS: PermissionId[] = PERMISSIONS.map((permission) => permission.id);

/** Permisos iniciales por rol. El superadministrador siempre conserva todos los permisos. */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionId[]> = {
  superadmin: ALL_PERMISSIONS,
  organization_admin: ALL_PERMISSIONS.filter((id) => id !== 'roles.gestionar'),
  site_coordinator: [
    'reservas.ver',
    'reservas.crear',
    'reservas.aprobar',
    'reservas.cancelar',
    'control.registrar',
    'bloqueos.gestionar',
    'incidencias.gestionar',
    'reportes.ver',
  ],
  approver: ['reservas.ver', 'reservas.aprobar', 'reportes.ver'],
  operator: ['reservas.ver', 'control.registrar', 'incidencias.gestionar'],
  user: ['reservas.ver', 'reservas.crear'],
};
