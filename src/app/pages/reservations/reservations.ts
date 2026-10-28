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

@Component({
  selector: 'app-reservations',
  imports: [Button, FilterChips, PageHeader, ReservationTable, SearchInput, StatePanel],
  templateUrl: './reservations.html',
})
export class Reservations {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = viewStateSignal(this.reservationService.list());

  readonly statusOptions: FilterChipOption[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'in_progress', label: 'En curso' },
    { value: 'completed', label: 'Finalizadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ];

  readonly query = signal('');
  readonly status = signal('all');

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
