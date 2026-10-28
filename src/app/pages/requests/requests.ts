import { Component, computed, inject, signal } from '@angular/core';

import { Button } from '../../components/ui/button/button';
import { FilterChipOption, FilterChips } from '../../components/ui/filter-chips/filter-chips';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationTable } from '../../components/ui/reservation-table/reservation-table';
import { SearchInput } from '../../components/ui/search-input/search-input';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { Reservation } from '../../core/models/reservation.model';
import { ReservationService } from '../../core/services/reservation.service';
import { matchesQuery } from '../../core/utils/search';
import { viewStateSignal } from '../../core/utils/view-state';

/** Solicitudes enviadas a revisión de la organización. Los borradores no se incluyen. */
@Component({
  selector: 'app-requests',
  imports: [Button, FilterChips, PageHeader, ReservationTable, SearchInput, StatePanel],
  templateUrl: './requests.html',
})
export class Requests {
  private readonly reservationService = inject(ReservationService);

  readonly data = viewStateSignal(this.reservationService.list());

  readonly statusOptions: FilterChipOption[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'adjustments_requested', label: 'Requieren ajustes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'rejected', label: 'Rechazadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ];

  readonly query = signal('');
  readonly status = signal('all');

  readonly requests = computed<Reservation[]>(() => {
    const state = this.data();
    if (state.status !== 'ready') {
      return [];
    }
    return state.data
      .filter((reservation) => reservation.status !== 'draft')
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  });

  readonly filtered = computed<Reservation[]>(() => {
    const status = this.status();
    return this.requests().filter(
      (reservation) =>
        (status === 'all' || reservation.status === status) &&
        matchesQuery(this.query(), [
          reservation.code,
          reservation.title,
          reservation.resource.name,
          reservation.requester.name,
        ]),
    );
  });

  clearFilters(): void {
    this.query.set('');
    this.status.set('all');
  }
}
