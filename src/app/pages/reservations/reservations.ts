import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  selector: 'app-reservations',
  imports: [Button, FilterChips, PageHeader, ReservationTable, RouterLink, SearchInput, StatePanel],
  templateUrl: './reservations.html',
})
export class Reservations {
  private readonly reservationService = inject(ReservationService);
  private readonly userService = inject(UserService);

  readonly data = viewStateSignal(combineLatest([this.reservationService.list(), this.userService.current()]));

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
  /** Filtro "Mis reservas": solo las reservas solicitadas por el usuario de la sesión. */
  readonly onlyMine = signal(false);

  readonly total = computed(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[0].length : 0;
  });

  /** Filtra por texto, estado y solicitante, y ordena por hora de inicio. */
  readonly filtered = computed<Reservation[]>(() => {
    const state = this.data();
    if (state.status !== 'ready') {
      return [];
    }

    const [reservations, user] = state.data;
    const status = this.status();
    const onlyMine = this.onlyMine();

    return reservations
      .filter(
        (reservation) =>
          (!onlyMine || reservation.requester.id === user.id) &&
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
    this.onlyMine.set(false);
  }
}
