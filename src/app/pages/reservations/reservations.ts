import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationStatusBadge } from '../../components/ui/reservation-status-badge/reservation-status-badge';
import { SearchInput } from '../../components/ui/search-input/search-input';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { ReservationService } from '../../core/services/reservation.service';
import { matchesQuery } from '../../core/utils/search';
import { viewStateSignal } from '../../core/utils/view-state';

type StatusFilter = ReservationStatus | 'all';

@Component({
  selector: 'app-reservations',
  imports: [DatePipe, Button, PageHeader, ReservationStatusBadge, SearchInput, StatePanel, TableShell],
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

    const status = this.status();

    return state.data
      .filter(
        (reservation) =>
          (status === 'all' || reservation.status === status) &&
          matchesQuery(this.query(), [
            reservation.code,
            reservation.title,
            reservation.resource.name,
            reservation.requester.name,
          ]),
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  });

  clearFilters(): void {
    this.query.set('');
    this.status.set('all');
  }
}
