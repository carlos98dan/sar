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

/** Indica si una reserva activa del recurso se cruza con el día y la franja indicados. */
function blocksSlot(
  reservation: Reservation,
  resourceId: string,
  date: string,
  from: number,
  to: number,
): boolean {
  return (
    reservation.resource.id === resourceId &&
    reservation.startsAt.startsWith(date) &&
    !INACTIVE_STATUSES.includes(reservation.status) &&
    isoTimeToMinutes(reservation.startsAt) < to &&
    from < isoTimeToMinutes(reservation.endsAt)
  );
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

  const reservation = reservations.find((item) =>
    blocksSlot(item, resource.id, window.date, from, to),
  );

  return reservation ? { status: 'booked', reservation } : { status: 'available', reservation: null };
}

/**
 * Primera reserva activa, distinta de la indicada, que se cruza con ella en el mismo recurso y día.
 * Devuelve null si la reserva está cancelada, rechazada o sin asistencia.
 */
export function findConflict(target: Reservation, reservations: Reservation[]): Reservation | null {
  if (INACTIVE_STATUSES.includes(target.status)) {
    return null;
  }

  const date = target.startsAt.slice(0, 10);
  const from = isoTimeToMinutes(target.startsAt);
  const to = isoTimeToMinutes(target.endsAt);

  return (
    reservations.find(
      (item) => item.id !== target.id && blocksSlot(item, target.resource.id, date, from, to),
    ) ?? null
  );
}
