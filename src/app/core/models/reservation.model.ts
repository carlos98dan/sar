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
}
