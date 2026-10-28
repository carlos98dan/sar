import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';

import { Alert } from '../../components/ui/alert/alert';
import { Badge } from '../../components/ui/badge/badge';
import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { ReservationService } from '../../core/services/reservation.service';
import { findConflict } from '../../core/utils/availability';
import { viewStateSignal } from '../../core/utils/view-state';

interface ApprovalRow {
  reservation: Reservation;
  /** Reserva activa que se cruza con esta, si existe. */
  conflict: Reservation | null;
}

@Component({
  selector: 'app-approvals',
  imports: [DatePipe, Alert, Badge, Button, PageHeader, StatePanel, TableShell],
  templateUrl: './approvals.html',
})
export class Approvals {
  private readonly reservationService = inject(ReservationService);

  /** Se emite tras cada decisión para volver a leer las reservas. */
  private readonly reload = new BehaviorSubject<void>(undefined);

  readonly data = viewStateSignal(
    this.reload.pipe(switchMap(() => this.reservationService.list())),
  );

  readonly actionError = signal<string | null>(null);

  /** Reservas pendientes de decisión, con su conflicto de horario si lo hay. */
  readonly pending = computed<ApprovalRow[]>(() => {
    const state = this.data();
    if (state.status !== 'ready') {
      return [];
    }

    const all = state.data;
    return all
      .filter((reservation) => reservation.status === 'pending')
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((reservation) => ({ reservation, conflict: findConflict(reservation, all) }));
  });

  decide(reservation: Reservation, status: ReservationStatus): void {
    this.actionError.set(null);
    this.reservationService.changeStatus(reservation.id, status).subscribe({
      next: () => this.reload.next(),
      error: () => this.actionError.set('No se pudo registrar la decisión. Intenta nuevamente.'),
    });
  }
}
