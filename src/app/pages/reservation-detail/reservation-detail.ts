import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, switchMap } from 'rxjs';

import { Alert } from '../../components/ui/alert/alert';
import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationStatusBadge } from '../../components/ui/reservation-status-badge/reservation-status-badge';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { HOURLY_RATES } from '../../core/config/booking-config';
import {
  DecisionRecord,
  Reservation,
  ReservationStatus,
} from '../../core/models/reservation.model';
import { OperationsStore } from '../../core/services/operations.store';
import { ReservationService } from '../../core/services/reservation.service';
import { UserService } from '../../core/services/user.service';
import { findConflict, isValidWindow } from '../../core/utils/availability';
import { toDateKey } from '../../core/utils/time';
import {
  ACTION_LABELS,
  ReservationAction,
  availableActions,
  requiresReason,
  targetStatus,
} from '../../core/utils/reservation-transitions';
import { viewStateSignal } from '../../core/utils/view-state';

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

interface ReservationView {
  reservation: Reservation;
  history: DecisionRecord[];
  all: Reservation[];
  actor: string;
}

@Component({
  selector: 'app-reservation-detail',
  imports: [DatePipe, Alert, Button, PageHeader, ReservationStatusBadge, RouterLink, StatePanel],
  templateUrl: './reservation-detail.html',
})
export class ReservationDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly reservationService = inject(ReservationService);
  private readonly userService = inject(UserService);
  private readonly operations = inject(OperationsStore);

  private readonly reload = new BehaviorSubject<void>(undefined);

  readonly data = viewStateSignal(
    combineLatest([this.route.paramMap, this.reload]).pipe(
      switchMap(([params]) => {
        const id = params.get('id') ?? '';
        return combineLatest([
          this.reservationService.getById(id),
          this.reservationService.history(id),
          this.reservationService.list(),
          this.userService.current(),
        ]);
      }),
    ),
  );

  readonly view = computed<ReservationView | null>(() => {
    const state = this.data();
    if (state.status !== 'ready') {
      return null;
    }
    const [reservation, history, all, user] = state.data;
    return { reservation, history, all, actor: user.fullName };
  });

  /** Acción que tiene un formulario abierto, con motivo o nuevo horario. */
  readonly openAction = signal<ReservationAction | null>(null);
  readonly reason = signal('');
  readonly newDate = signal(toDateKey(new Date()));
  readonly newFrom = signal('08:00');
  readonly newTo = signal('10:00');
  readonly actionError = signal<string | null>(null);

  readonly actions = computed<ReservationAction[]>(() => {
    const current = this.view();
    return current ? availableActions(current.reservation.status) : [];
  });

  readonly cost = computed(() => {
    const current = this.view();
    if (!current) {
      return null;
    }
    const { startsAt, endsAt, resource } = current.reservation;
    const hours = (Date.parse(endsAt) - Date.parse(startsAt)) / 3600000;
    const rate = this.operations.rates()[resource.id] ?? HOURLY_RATES[resource.id] ?? 0;
    return { hours, rate, total: hours * rate };
  });

  readonly formatCop = (value: number) => COP.format(value);

  open(action: ReservationAction): void {
    const current = this.view();
    this.actionError.set(null);
    this.reason.set('');
    if (current) {
      this.newDate.set(current.reservation.startsAt.slice(0, 10));
      this.newFrom.set(current.reservation.startsAt.slice(11, 16));
      this.newTo.set(current.reservation.endsAt.slice(11, 16));
    }
    this.openAction.set(action);
  }

  close(): void {
    this.openAction.set(null);
    this.reason.set('');
    this.actionError.set(null);
  }

  /** Ejecuta una acción directa, sin motivo ni nuevo horario. */
  run(action: ReservationAction): void {
    const current = this.view();
    if (!current) {
      return;
    }
    const { reservation, all, actor } = current;

    if (action === 'approve') {
      const conflict = findConflict(reservation, all);
      if (conflict && (conflict.status === 'confirmed' || conflict.status === 'in_progress')) {
        this.actionError.set(
          `No se puede aprobar: se cruza con ${conflict.code}, que ya está confirmada o en curso.`,
        );
        return;
      }
    }

    this.save(reservation, targetStatus(action, reservation.status), ACTION_LABELS[action], actor);
  }

  /** Confirma la acción que tenía formulario abierto: motivo obligatorio o nuevo horario validado. */
  confirm(): void {
    const current = this.view();
    const action = this.openAction();
    if (!current || !action) {
      return;
    }
    const { reservation, all, actor } = current;

    if (action === 'reschedule') {
      this.reschedule(reservation, all, actor);
      return;
    }

    const comment = this.reason().trim();
    if (requiresReason(action) && !comment) {
      return;
    }
    this.save(
      reservation,
      targetStatus(action, reservation.status),
      ACTION_LABELS[action],
      actor,
      comment,
    );
  }

  private reschedule(reservation: Reservation, all: Reservation[], actor: string): void {
    const startsAt = `${this.newDate()}T${this.newFrom()}:00-05:00`;
    const endsAt = `${this.newDate()}T${this.newTo()}:00-05:00`;
    const window = { date: this.newDate(), from: this.newFrom(), to: this.newTo() };

    if (!isValidWindow(window)) {
      this.actionError.set('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    const candidate = { ...reservation, startsAt, endsAt };
    const conflict = findConflict(candidate, all);
    if (conflict) {
      this.actionError.set(`El nuevo horario se cruza con ${conflict.code}. Elige otro horario.`);
      return;
    }

    this.reservationService.reschedule(reservation, startsAt, endsAt, actor).subscribe({
      next: () => this.finish(),
      error: () => this.actionError.set('No se pudo reprogramar la reserva. Intenta nuevamente.'),
    });
  }

  private save(
    reservation: Reservation,
    status: ReservationStatus,
    action: string,
    actor: string,
    comment = '',
  ): void {
    this.reservationService.changeStatus(reservation, status, action, actor, comment).subscribe({
      next: () => this.finish(),
      error: () => this.actionError.set('No se pudo registrar la acción. Intenta nuevamente.'),
    });
  }

  private finish(): void {
    this.close();
    this.reload.next();
  }

  readonly labels = ACTION_LABELS;
  readonly validWindow = computed(() =>
    isValidWindow({ date: this.newDate(), from: this.newFrom(), to: this.newTo() }),
  );

  needsReason(action: ReservationAction): boolean {
    return requiresReason(action);
  }

  customEntries(fields: Record<string, string | number>): [string, string | number][] {
    return Object.entries(fields);
  }
}
