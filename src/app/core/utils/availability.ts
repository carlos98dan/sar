import { Reservation, ReservationStatus } from '../models/reservation.model';
import { Resource } from '../models/resource.model';
import { isoTimeToMinutes, timeToMinutes } from './time';

/** Estados que no bloquean el recurso. Mismo criterio que el calendario. */
const INACTIVE_STATUSES: ReservationStatus[] = ['cancelled', 'rejected', 'no_show'];

export interface AvailabilityWindow {
  /** Fecha en formato `YYYY-MM-DD`. */
  date: string;
  /** Hora de inicio `HH:mm`. */
  from: string;
  /** Hora de fin `HH:mm`. */
  to: string;
}

export interface WindowEvaluation {
  /** `unavailable` cuando el recurso está en mantenimiento o fuera de servicio. */
  status: 'available' | 'booked' | 'unavailable';
  /** Primera reserva activa que se cruza con la franja, si existe. */
  reservation: Reservation | null;
}

export function isValidWindow(window: AvailabilityWindow): boolean {
  return timeToMinutes(window.to) > timeToMinutes(window.from);
}

/**
 * Indica si un recurso está libre en toda la franja.
 * El estado `occupied` del recurso describe el momento actual, así que no se usa para una fecha y hora concretas.
 */
export function evaluateWindow(
  resource: Resource,
  reservations: Reservation[],
  window: AvailabilityWindow,
): WindowEvaluation {
  if (resource.availability === 'maintenance' || resource.availability === 'out_of_service') {
    return { status: 'unavailable', reservation: null };
  }

  const from = timeToMinutes(window.from);
  const to = timeToMinutes(window.to);

  const reservation = reservations.find(
    (item) =>
      item.resource.id === resource.id &&
      item.startsAt.startsWith(window.date) &&
      !INACTIVE_STATUSES.includes(item.status) &&
      isoTimeToMinutes(item.startsAt) < to &&
      from < isoTimeToMinutes(item.endsAt),
  );

  return reservation
    ? { status: 'booked', reservation }
    : { status: 'available', reservation: null };
}
