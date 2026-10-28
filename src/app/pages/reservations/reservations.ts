import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationStatusBadge } from '../../components/ui/reservation-status-badge/reservation-status-badge';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { ReservationService } from '../../core/services/reservation.service';
import { viewStateSignal } from '../../core/utils/view-state';

type StatusFilter = ReservationStatus | 'all';

@Component({
  selector: 'app-reservations',
  imports: [DatePipe, PageHeader, ReservationStatusBadge, StatePanel],
  templateUrl: './reservations.html',
})
export class Reservations {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = viewStateSignal(this.reservationService.list());

  readonly statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'in_progress', label: 'En curso' },
    { value: 'completed', label: 'Finalizadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ];

  readonly query = signal('');
  readonly status = signal<StatusFilter>('all');

  /** Filtra por texto y estado, y ordena por hora de inicio. */
  readonly filtered = computed<Reservation[]>(() => {
    const state = this.reservations();
    if (state.status !== 'ready') {
      return [];
    }

    const term = this.query().trim().toLowerCase();
    const status = this.status();

    return state.data
      .filter(
        (reservation) =>
          (status === 'all' || reservation.status === status) &&
          (!term ||
            [reservation.code, reservation.title, reservation.resource.name, reservation.requester.name]
              .some((value) => value.toLowerCase().includes(term))),
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  });

  clearFilters(): void {
    this.query.set('');
    this.status.set('all');
  }
}
