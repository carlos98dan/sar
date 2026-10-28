import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, switchMap } from 'rxjs';

import { Alert } from '../../components/ui/alert/alert';
import { Badge } from '../../components/ui/badge/badge';
import { Button } from '../../components/ui/button/button';
import { FilterChipOption, FilterChips } from '../../components/ui/filter-chips/filter-chips';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationTable } from '../../components/ui/reservation-table/reservation-table';
import { SearchInput } from '../../components/ui/search-input/search-input';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { DecisionRecord, Reservation } from '../../core/models/reservation.model';
import { ReservationService } from '../../core/services/reservation.service';
import { UserService } from '../../core/services/user.service';
import { findConflict } from '../../core/utils/availability';
import { matchesQuery } from '../../core/utils/search';
import {
  ACTION_LABELS,
  ReservationAction,
  isOccupying,
  targetStatus,
} from '../../core/utils/reservation-transitions';
import { viewStateSignal } from '../../core/utils/view-state';

interface DecisionRow {
  reservation: Reservation;
  /** Reserva activa que se cruza con esta, si existe. */
  conflict: Reservation | null;
}

const VIEW_OPTIONS: FilterChipOption[] = [
  { value: 'decidir', label: 'Por decidir' },
  { value: 'bandeja', label: 'Bandeja' },
  { value: 'historial', label: 'Historial' },
];

const STATUS_OPTIONS: FilterChipOption[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'adjustments_requested', label: 'Requieren ajustes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

/** Solicitudes y aprobaciones: decidir, consultar la bandeja completa y revisar el historial de decisiones. */
@Component({
  selector: 'app-requests',
  imports: [
    Alert,
    Badge,
    Button,
    DatePipe,
    FilterChips,
    PageHeader,
    ReservationTable,
    RouterLink,
    SearchInput,
    StatePanel,
    TableShell,
  ],
  templateUrl: './requests.html',
})
export class Requests {
  private readonly reservationService = inject(ReservationService);
  private readonly userService = inject(UserService);

  /** Se emite tras cada decisión para volver a leer reservas e historial. */
  private readonly reload = new BehaviorSubject<void>(undefined);

  readonly data = viewStateSignal(
    this.reload.pipe(
      switchMap(() =>
        combineLatest([
          this.reservationService.list(),
          this.reservationService.history(),
          this.userService.current(),
        ]),
      ),
    ),
  );

  readonly viewOptions = VIEW_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly view = signal('decidir');
  readonly query = signal('');
  readonly status = signal('all');

  /** Decisión que espera un motivo escrito: rechazar o pedir ajustes. */
  readonly reasonFor = signal<{ id: string; action: ReservationAction } | null>(null);
  readonly reason = signal('');
  readonly actionError = signal<string | null>(null);

  readonly reservations = computed<Reservation[]>(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[0] : [];
  });

  readonly decisions = computed<DecisionRecord[]>(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[1] : [];
  });

  readonly actorName = computed(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[2].fullName : '';
  });

  /** Solicitudes pendientes, con su conflicto de horario si lo hay. */
  readonly toDecide = computed<DecisionRow[]>(() => {
    const all = this.reservations();
    return all
      .filter((reservation) => reservation.status === 'pending')
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((reservation) => ({ reservation, conflict: findConflict(reservation, all) }));
  });

  /** Todas las solicitudes enviadas a revisión. Los borradores no se incluyen. */
  readonly requests = computed<Reservation[]>(() =>
    this.reservations()
      .filter((reservation) => reservation.status !== 'draft')
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  );

  readonly bandeja = computed<Reservation[]>(() => {
    const status = this.status();
    const query = this.query();
    return this.requests().filter(
      (reservation) =>
        (status === 'all' || reservation.status === status) &&
        matchesQuery(query, [reservation.code, reservation.title, reservation.resource.name, reservation.requester.name]),
    );
  });

  decide(reservation: Reservation, action: ReservationAction, comment = ''): void {
    this.actionError.set(null);
    this.reservationService
      .changeStatus(reservation, targetStatus(action, reservation.status), ACTION_LABELS[action], this.actorName(), comment)
      .subscribe({
        next: () => {
          this.reasonFor.set(null);
          this.reason.set('');
          this.reload.next();
        },
        error: () => this.actionError.set('No se pudo registrar la decisión. Intenta nuevamente.'),
      });
  }

  approve(row: DecisionRow): void {
    if (row.conflict && isOccupying(row.conflict.status)) {
      this.actionError.set(
        `No se puede aprobar: se cruza con ${row.conflict.code}, que ya está confirmada o en curso.`,
      );
      return;
    }
    this.decide(row.reservation, 'approve');
  }

  /** Abre el campo de motivo para una acción que lo exige. */
  askReason(reservation: Reservation, action: ReservationAction): void {
    this.reasonFor.set({ id: reservation.id, action });
    this.reason.set('');
  }

  confirmReason(reservation: Reservation): void {
    const pending = this.reasonFor();
    const comment = this.reason().trim();
    if (!pending || !comment) {
      return;
    }
    this.decide(reservation, pending.action, comment);
  }

  cancelReason(): void {
    this.reasonFor.set(null);
    this.reason.set('');
  }

  reasonLabel(action: ReservationAction | undefined): string {
    return action === 'reject' ? 'Motivo del rechazo' : 'Ajustes que debe realizar el solicitante';
  }
}
