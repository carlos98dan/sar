export type UserRole =
  | 'superadmin'
  | 'organization_admin'
  | 'site_coordinator'
  | 'approver'
  | 'operator'
  | 'user';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  defaultSiteName: string;
  active: boolean;
  /** ISO 8601 o null si nunca ha accedido. */
  lastAccessAt: string | null;
}
