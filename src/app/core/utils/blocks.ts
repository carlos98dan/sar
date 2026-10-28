import { Reservation } from '../models/reservation.model';
import { Block } from '../services/operations.store';
import { isOccupying } from './reservation-transitions';

/**
 * Reservas activas o pendientes que se cruzan con un bloqueo.
 * Las fechas ISO comparten zona horaria (-05:00), así que se comparan como texto.
 */
export function reservationsAffectedBy(block: Block, reservations: Reservation[]): Reservation[] {
  return reservations.filter(
    (reservation) =>
      (block.resourceId === null || reservation.resource.id === block.resourceId) &&
      (isOccupying(reservation.status) || reservation.status === 'pending') &&
      reservation.startsAt < block.endsAt &&
      block.startsAt < reservation.endsAt,
  );
}
