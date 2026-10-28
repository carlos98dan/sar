import { ReservationStatus } from '../models/reservation.model';

export type ReservationAction =
  'approve' | 'adjust' | 'reject' | 'cancel' | 'reschedule' | 'start' | 'finish' | 'no_show';

/** Estado resultante de cada acción. `reschedule` conserva el estado actual. */
const TARGET_STATUS: Record<ReservationAction, ReservationStatus | null> = {
  approve: 'confirmed',
  adjust: 'adjustments_requested',
  reject: 'rejected',
  cancel: 'cancelled',
  reschedule: null,
  start: 'in_progress',
  finish: 'completed',
  no_show: 'no_show',
};

export const ACTION_LABELS: Record<ReservationAction, string> = {
  approve: 'Aprobar',
  adjust: 'Pedir ajustes',
  reject: 'Rechazar',
  cancel: 'Cancelar',
  reschedule: 'Reprogramar',
  start: 'Registrar llegada',
  finish: 'Registrar salida',
  no_show: 'Registrar no asistencia',
};

/** Acciones que exigen un motivo escrito. */
const REQUIRES_REASON: ReservationAction[] = ['adjust', 'reject', 'cancel'];

export function targetStatus(
  action: ReservationAction,
  current: ReservationStatus,
): ReservationStatus {
  return TARGET_STATUS[action] ?? current;
}

export function requiresReason(action: ReservationAction): boolean {
  return REQUIRES_REASON.includes(action);
}

/** Acciones permitidas según el estado actual. Los permisos se aplican en la capa de pantalla. */
export function availableActions(status: ReservationStatus): ReservationAction[] {
  switch (status) {
    case 'pending':
      return ['approve', 'adjust', 'reject', 'cancel'];
    case 'adjustments_requested':
      return ['reschedule', 'cancel'];
    case 'confirmed':
      return ['reschedule', 'cancel', 'start', 'no_show'];
    case 'in_progress':
      return ['finish'];
    default:
      return [];
  }
}

/** Reservas que ocupan el recurso de forma efectiva. */
export function isOccupying(status: ReservationStatus): boolean {
  return status === 'confirmed' || status === 'in_progress';
}
