import { ResourceRef } from './resource.model';

export type ReservationStatus =
  | 'draft'
  | 'pending'
  | 'adjustments_requested'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'in_progress'
  | 'completed'
  | 'no_show';

/** Acción registrada en el historial: aprobar, rechazar, reprogramar, etc. */
export interface DecisionRecord {
  id: string;
  reservationId: string;
  reservationCode: string;
  action: string;
  status: ReservationStatus;
  actorName: string;
  comment: string;
  /** ISO 8601 del momento de la acción. */
  at: string;
}

/** Datos necesarios para crear una reserva desde el asistente. */
export type ReservationDraft = Pick<
  Reservation,
  'title' | 'resource' | 'requester' | 'attendees' | 'startsAt' | 'endsAt' | 'status' | 'customFields'
>;

export interface Reservation {
  id: string;
  code: string;
  title: string;
  resource: ResourceRef;
  requester: {
    id: string;
    name: string;
    department: string;
  };
  attendees: number;
  /** ISO 8601 con zona horaria (America/Bogota, -05:00). */
  startsAt: string;
  endsAt: string;
  status: ReservationStatus;
  createdAt: string;
  /** Valores de los campos definidos por la categoría del recurso. */
  customFields?: Record<string, string | number>;
}
