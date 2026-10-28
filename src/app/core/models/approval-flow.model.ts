import { UserRole } from './user.model';

/** Roles que pueden aprobar una reserva. */
export type ApprovalRole = Extract<
  UserRole,
  'organization_admin' | 'site_coordinator' | 'approver' | 'operator'
>;

/** Pasos en orden: la reserva pasa por cada rol antes de confirmarse. */
export interface ApprovalFlow {
  id: string;
  name: string;
  /** Categoría a la que aplica, o `null` para todas. */
  category: string | null;
  steps: ApprovalRole[];
  active: boolean;
}
