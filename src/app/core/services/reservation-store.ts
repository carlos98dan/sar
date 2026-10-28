import { Injectable } from '@angular/core';

import { DecisionRecord, Reservation } from '../models/reservation.model';

/**
 * Cambios hechos durante la sesión sobre las reservas de demostración.
 * Se pierden al recargar la página. BACKEND: el servidor reemplaza esta clase.
 */
@Injectable({ providedIn: 'root' })
export class ReservationStore {
  private readonly changes = new Map<string, Partial<Reservation>>();
  private readonly created: Reservation[] = [];
  private readonly decisions: DecisionRecord[] = [];

  /** Aplica los cambios y agrega las reservas creadas en la sesión. */
  apply(reservations: Reservation[]): Reservation[] {
    return [...reservations, ...this.created].map((reservation) => {
      const change = this.changes.get(reservation.id);
      return change ? { ...reservation, ...change } : reservation;
    });
  }

  update(id: string, change: Partial<Reservation>): void {
    this.changes.set(id, { ...this.changes.get(id), ...change });
  }

  add(reservation: Reservation): void {
    this.created.push(reservation);
  }

  record(decision: DecisionRecord): void {
    this.decisions.unshift(decision);
  }

  history(): DecisionRecord[] {
    return [...this.decisions];
  }
}
