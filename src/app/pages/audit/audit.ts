import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationStatusBadge } from '../../components/ui/reservation-status-badge/reservation-status-badge';
import { SearchInput } from '../../components/ui/search-input/search-input';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { DecisionRecord } from '../../core/models/reservation.model';
import { ReservationService } from '../../core/services/reservation.service';
import { matchesQuery } from '../../core/utils/search';
import { viewStateSignal } from '../../core/utils/view-state';

/** Registro de acciones sobre las reservas: quién hizo qué, cuándo y con qué comentario. */
@Component({
  selector: 'app-audit',
  imports: [
    DatePipe,
    Button,
    PageHeader,
    ReservationStatusBadge,
    RouterLink,
    SearchInput,
    StatePanel,
    TableShell,
  ],
  templateUrl: './audit.html',
})
export class Audit {
  private readonly reservationService = inject(ReservationService);

  readonly records = viewStateSignal(this.reservationService.history());

  readonly query = signal('');
  readonly action = signal('all');
  /** Fechas en formato `YYYY-MM-DD`. Vacío significa sin límite. */
  readonly from = signal('');
  readonly to = signal('');

  readonly actions = computed(() => {
    const state = this.records();
    if (state.status !== 'ready') {
      return [];
    }
    return [...new Set(state.data.map((record) => record.action))].sort();
  });

  readonly filtered = computed<DecisionRecord[]>(() => {
    const state = this.records();
    if (state.status !== 'ready') {
      return [];
    }
    const action = this.action();
    const from = this.from();
    const to = this.to();

    return state.data
      .filter((record) => {
        const day = record.at.slice(0, 10);
        return (
          (action === 'all' || record.action === action) &&
          (!from || day >= from) &&
          (!to || day <= to) &&
          matchesQuery(this.query(), [
            record.reservationCode,
            record.action,
            record.actorName,
            record.comment,
          ])
        );
      })
      .sort((a, b) => b.at.localeCompare(a.at));
  });

  readonly hasFilters = computed(
    () => this.query() !== '' || this.action() !== 'all' || this.from() !== '' || this.to() !== '',
  );

  clearFilters(): void {
    this.query.set('');
    this.action.set('all');
    this.from.set('');
    this.to.set('');
  }
}
