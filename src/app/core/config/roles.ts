import { UserRole } from '../models/user.model';

/** Orden en que se muestran los roles en las pantallas de administración. */
export const ROLE_ORDER: UserRole[] = [
  'superadmin',
  'organization_admin',
  'site_coordinator',
  'approver',
  'operator',
  'user',
];

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Superadministrador',
  organization_admin: 'Administrador de organización',
  site_coordinator: 'Coordinador de sede',
  approver: 'Aprobador',
  operator: 'Operador',
  user: 'Usuario',
};
