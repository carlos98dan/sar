import { Component, computed, inject, signal } from '@angular/core';
import { combineLatest } from 'rxjs';

import { Button } from '../../components/ui/button/button';
import { FilterChipOption, FilterChips } from '../../components/ui/filter-chips/filter-chips';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationTable } from '../../components/ui/reservation-table/reservation-table';
import { SearchInput } from '../../components/ui/search-input/search-input';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { Reservation } from '../../core/models/reservation.model';
import { ReservationService } from '../../core/services/reservation.service';
import { UserService } from '../../core/services/user.service';
import { matchesQuery } from '../../core/utils/search';
import { viewStateSignal } from '../../core/utils/view-state';

@Component({
  selector: 'app-my-reservations',
  imports: [Button, FilterChips, PageHeader, ReservationTable, SearchInput, StatePanel],
  templateUrl: './my-reservations.html',
})
export class MyReservations {
  private readonly reservationService = inject(ReservationService);
  private readonly userService = inject(UserService);

  readonly data = viewStateSignal(
    combineLatest([this.reservationService.list(), this.userService.current()]),
  );

  readonly statusOptions: FilterChipOption[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'adjustments_requested', label: 'Requieren ajustes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'in_progress', label: 'En curso' },
    { value: 'completed', label: 'Finalizadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ];

  readonly query = signal('');
  readonly status = signal('all');

  /** Reservas solicitadas por el usuario de la sesión, de la más próxima a la más lejana. */
  readonly mine = computed<Reservation[]>(() => {
    const state = this.data();
    if (state.status !== 'ready') {
      return [];
    }

    const [reservations, user] = state.data;
    return reservations
      .filter((reservation) => reservation.requester.id === user.id)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  });

  readonly filtered = computed<Reservation[]>(() => {
    const status = this.status();
    return this.mine().filter(
      (reservation) =>
        (status === 'all' || reservation.status === status) &&
        matchesQuery(this.query(), [
          reservation.code,
          reservation.title,
          reservation.resource.name,
        ]),
    );
  });

  clearFilters(): void {
    this.query.set('');
    this.status.set('all');
  }
}
