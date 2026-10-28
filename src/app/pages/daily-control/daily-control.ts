import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, switchMap } from 'rxjs';

import { Alert } from '../../components/ui/alert/alert';
import { Button } from '../../components/ui/button/button';
import { FilterChipOption, FilterChips } from '../../components/ui/filter-chips/filter-chips';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationStatusBadge } from '../../components/ui/reservation-status-badge/reservation-status-badge';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { ReservationService } from '../../core/services/reservation.service';
import { UserService } from '../../core/services/user.service';
import {
  ACTION_LABELS,
  ReservationAction,
  availableActions,
  targetStatus,
} from '../../core/utils/reservation-transitions';
import { toDateKey } from '../../core/utils/time';
import { viewStateSignal } from '../../core/utils/view-state';

/** Acciones de control de llegada, salida y ausencia que se registran en el día. */
const CONTROL_ACTIONS: ReservationAction[] = ['start', 'finish', 'no_show'];

/** Estados que aparecen en el control del día. */
const DAY_STATUSES: ReservationStatus[] = ['confirmed', 'in_progress', 'completed', 'no_show'];

const VIEW_OPTIONS: FilterChipOption[] = [
  { value: 'hoy', label: 'Llegadas y salidas' },
  { value: 'ausencias', label: 'No asistencias' },
];

@Component({
  selector: 'app-daily-control',
  imports: [
    DatePipe,
    Alert,
    Button,
    FilterChips,
    PageHeader,
    ReservationStatusBadge,
    RouterLink,
    StatePanel,
    TableShell,
  ],
  templateUrl: './daily-control.html',
})
export class DailyControl {
  private readonly reservationService = inject(ReservationService);
  private readonly userService = inject(UserService);

  private readonly reload = new BehaviorSubject<void>(undefined);

  readonly data = viewStateSignal(
    this.reload.pipe(
      switchMap(() => combineLatest([this.reservationService.list(), this.userService.current()])),
    ),
  );

  readonly viewOptions = VIEW_OPTIONS;
  readonly view = signal('hoy');
  readonly date = signal(toDateKey(new Date()));
  readonly actionError = signal<string | null>(null);

  readonly rows = computed<Reservation[]>(() => {
    const state = this.data();
    if (state.status !== 'ready') {
      return [];
    }
    const [reservations] = state.data;
    const day = this.date();
    const onDay = reservations.filter((reservation) => reservation.startsAt.startsWith(day));

    const statuses = this.view() === 'ausencias' ? ['no_show'] : DAY_STATUSES;
    return onDay
      .filter((reservation) => statuses.includes(reservation.status))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  });

  readonly labels = ACTION_LABELS;

  controlActions(reservation: Reservation): ReservationAction[] {
    return availableActions(reservation.status).filter((action) =>
      CONTROL_ACTIONS.includes(action),
    );
  }

  /** Registra la llegada, la salida o la ausencia de una reserva. */
  run(reservation: Reservation, action: ReservationAction): void {
    const state = this.data();
    if (state.status !== 'ready') {
      return;
    }
    const actor = state.data[1].fullName;

    this.actionError.set(null);
    this.reservationService
      .changeStatus(
        reservation,
        targetStatus(action, reservation.status),
        ACTION_LABELS[action],
        actor,
      )
      .subscribe({
        next: () => this.reload.next(),
        error: () => this.actionError.set('No se pudo registrar la acción. Intenta nuevamente.'),
      });
  }
}
