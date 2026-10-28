import { ROLE_LABELS } from './roles';
import {
  NotificationChannel,
  NotificationEvent,
  NotificationRecipient,
  NotificationRule,
} from '../models/notification.model';

export const EVENT_LABELS: Record<NotificationEvent, string> = {
  reservation_requested: 'Nueva solicitud de reserva',
  reservation_approved: 'Reserva aprobada',
  reservation_rejected: 'Reserva rechazada',
  reservation_adjustments: 'Ajustes solicitados',
  reservation_cancelled: 'Reserva cancelada',
  reservation_reminder: 'Recordatorio antes del inicio',
  block_created: 'Bloqueo que afecta reservas',
  incident_opened: 'Incidencia nueva',
};

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Correo',
  in_app: 'En la aplicación',
};

export const RECIPIENT_LABELS: Record<NotificationRecipient, string> = {
  requester: 'Solicitante',
  organization_admin: ROLE_LABELS.organization_admin,
  site_coordinator: ROLE_LABELS.site_coordinator,
  approver: ROLE_LABELS.approver,
  operator: ROLE_LABELS.operator,
};

function rule(
  event: NotificationEvent,
  channels: NotificationChannel[],
  recipients: NotificationRecipient[],
): NotificationRule {
  return { id: event, event, channels, recipients, active: true };
}

/** Reglas iniciales de demostración, una por evento. */
export const DEFAULT_NOTIFICATION_RULES: NotificationRule[] = [
  rule('reservation_requested', ['email', 'in_app'], ['site_coordinator', 'approver']),
  rule('reservation_approved', ['email', 'in_app'], ['requester']),
  rule('reservation_rejected', ['email', 'in_app'], ['requester']),
  rule('reservation_adjustments', ['email', 'in_app'], ['requester']),
  rule('reservation_cancelled', ['email', 'in_app'], ['requester', 'site_coordinator']),
  rule('reservation_reminder', ['email'], ['requester']),
  rule('block_created', ['email', 'in_app'], ['site_coordinator', 'organization_admin']),
  rule('incident_opened', ['in_app'], ['site_coordinator', 'operator']),
];
