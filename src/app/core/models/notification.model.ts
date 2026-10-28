/** Eventos del sistema que generan una notificación. Cada uno tiene una sola regla. */
export type NotificationEvent =
  | 'reservation_requested'
  | 'reservation_approved'
  | 'reservation_rejected'
  | 'reservation_adjustments'
  | 'reservation_cancelled'
  | 'reservation_reminder'
  | 'block_created'
  | 'incident_opened';

export type NotificationChannel = 'email' | 'in_app';

/** Solicitante de la reserva o un rol de la organización. */
export type NotificationRecipient =
  'requester' | 'organization_admin' | 'site_coordinator' | 'approver' | 'operator';

export interface NotificationRule {
  /** Igual al evento: cada evento tiene una sola regla. */
  id: NotificationEvent;
  event: NotificationEvent;
  channels: NotificationChannel[];
  recipients: NotificationRecipient[];
  active: boolean;
}
