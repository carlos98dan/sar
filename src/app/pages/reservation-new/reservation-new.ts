import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';

import { Alert } from '../../components/ui/alert/alert';
import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { configFor, HOURLY_RATES } from '../../core/config/booking-config';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { Resource } from '../../core/models/resource.model';
import { OperationsStore } from '../../core/services/operations.store';
import {
  ReservationConflictError,
  ReservationService,
} from '../../core/services/reservation.service';
import { ResourceService } from '../../core/services/resource.service';
import { UserService } from '../../core/services/user.service';
import {
  AvailabilityWindow,
  WindowEvaluation,
  evaluateWindow,
  isValidWindow,
} from '../../core/utils/availability';
import { ruleViolations } from '../../core/utils/rules';
import { timeToMinutes, toDateKey } from '../../core/utils/time';
import { viewStateSignal } from '../../core/utils/view-state';

const STEP_LABELS = [
  'Categoría',
  'Recurso',
  'Fecha y horario',
  'Disponibilidad',
  'Datos',
  'Confirmación',
];

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Asistente de reserva en seis pasos. Los campos adicionales dependen de la categoría del recurso. */
@Component({
  selector: 'app-reservation-new',
  imports: [Alert, Button, PageHeader, RouterLink, StatePanel],
  templateUrl: './reservation-new.html',
})
export class ReservationNew {
  private readonly router = inject(Router);
  private readonly resourceService = inject(ResourceService);
  private readonly reservationService = inject(ReservationService);
  private readonly userService = inject(UserService);
  private readonly operations = inject(OperationsStore);

  readonly data = viewStateSignal(
    combineLatest([
      this.resourceService.list(),
      this.reservationService.list(),
      this.userService.current(),
    ]),
  );

  readonly stepLabels = STEP_LABELS;
  readonly step = signal(0);

  readonly category = signal('');
  readonly resourceId = signal('');
  readonly date = signal(toDateKey(new Date()));
  readonly from = signal('08:00');
  readonly to = signal('10:00');
  readonly attendees = signal(1);

  readonly title = signal('');
  readonly department = signal('');
  readonly fieldValues = signal<Record<string, string | number>>({});
  readonly acceptPolicy = signal(false);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly conflict = signal<Reservation | null>(null);

  readonly resources = computed<Resource[]>(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[0] : [];
  });

  readonly reservations = computed<Reservation[]>(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[1] : [];
  });

  readonly user = computed(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[2] : null;
  });

  readonly categories = computed(() =>
    [...new Set(this.resources().map((resource) => resource.category))].sort(),
  );

  readonly categoryResources = computed(() =>
    this.resources().filter((resource) => resource.category === this.category()),
  );

  readonly resource = computed(
    () => this.resources().find((item) => item.id === this.resourceId()) ?? null,
  );

  readonly config = computed(() => configFor(this.category()));

  readonly window = computed<AvailabilityWindow>(() => ({
    date: this.date(),
    from: this.from(),
    to: this.to(),
  }));

  readonly windowValid = computed(() => isValidWindow(this.window()));

  readonly startsAt = computed(() => `${this.date()}T${this.from()}:00-05:00`);

  readonly endsAt = computed(() => `${this.date()}T${this.to()}:00-05:00`);

  readonly durationMinutes = computed(() => timeToMinutes(this.to()) - timeToMinutes(this.from()));

  readonly anticipationHours = computed(() => (Date.parse(this.startsAt()) - Date.now()) / 3600000);

  readonly violations = computed(() =>
    this.windowValid()
      ? ruleViolations(this.operations.rules(), {
          category: this.category(),
          anticipationHours: this.anticipationHours(),
          durationMinutes: this.durationMinutes(),
        })
      : [],
  );

  readonly evaluation = computed<WindowEvaluation | null>(() => {
    const current = this.resource();
    if (!current || !this.windowValid()) {
      return null;
    }
    return evaluateWindow(current, this.reservations(), this.window());
  });

  /** Otros recursos de la misma categoría libres en la franja elegida. */
  readonly alternatives = computed(() => {
    const window = this.window();
    if (!this.windowValid()) {
      return [];
    }
    return this.categoryResources()
      .filter((item) => item.id !== this.resourceId())
      .map((item) => ({
        resource: item,
        evaluation: evaluateWindow(item, this.reservations(), window),
      }))
      .filter((item) => item.evaluation.status === 'available');
  });

  readonly dataValid = computed(() => {
    const requiredFilled = this.config().fields.every(
      (field) => !field.required || String(this.fieldValues()[field.key] ?? '').trim() !== '',
    );
    return this.title().trim().length >= 3 && requiredFilled && this.acceptPolicy();
  });

  readonly attendeesValid = computed(() => {
    const current = this.resource();
    return !!current && this.attendees() >= 1 && this.attendees() <= current.capacity;
  });

  /** Indica si el paso actual permite avanzar. */
  readonly canAdvance = computed(() => {
    switch (this.step()) {
      case 0:
        return this.category() !== '';
      case 1:
        return this.resource() !== null;
      case 2:
        return this.windowValid() && this.attendeesValid() && this.violations().length === 0;
      case 3:
        return this.evaluation()?.status === 'available';
      case 4:
        return this.dataValid();
      default:
        return false;
    }
  });

  readonly cost = computed(() => {
    const current = this.resource();
    const rate = current
      ? (this.operations.rates()[current.id] ?? HOURLY_RATES[current.id] ?? 0)
      : 0;
    const hours = this.durationMinutes() / 60;
    return { rate, hours, total: rate * hours };
  });

  readonly requiresApproval = computed(() => this.config().requiresApproval);

  readonly formatCop = (value: number) => COP.format(value);

  resourcesIn(category: string): number {
    return this.resources().filter((resource) => resource.category === category).length;
  }

  rateOf(resourceId: string): number {
    return this.operations.rates()[resourceId] ?? HOURLY_RATES[resourceId] ?? 0;
  }

  selectCategory(name: string): void {
    this.category.set(name);
    this.resourceId.set('');
    this.fieldValues.set({});
  }

  selectResource(id: string): void {
    this.resourceId.set(id);
  }

  setField(key: string, value: string | number): void {
    this.fieldValues.update((values) => ({ ...values, [key]: value }));
  }

  fieldValue(key: string): string | number {
    return this.fieldValues()[key] ?? '';
  }

  next(): void {
    if (this.canAdvance() && this.step() < STEP_LABELS.length - 1) {
      this.step.update((value) => value + 1);
    }
  }

  back(): void {
    this.step.update((value) => Math.max(0, value - 1));
  }

  goTo(index: number): void {
    if (index <= this.step()) {
      this.step.set(index);
    }
  }

  /** Crea la reserva. La disponibilidad se revalida en el servidor antes de confirmar. */
  submit(): void {
    const current = this.resource();
    const user = this.user();
    if (!current || !user || this.submitting()) {
      return;
    }

    const status: ReservationStatus = this.requiresApproval() ? 'pending' : 'confirmed';
    this.submitting.set(true);
    this.submitError.set(null);
    this.conflict.set(null);

    this.reservationService
      .create(
        {
          title: this.title().trim(),
          resource: { id: current.id, name: current.name },
          requester: {
            id: user.id,
            name: user.fullName,
            department: this.department().trim() || user.department,
          },
          attendees: this.attendees(),
          startsAt: this.startsAt(),
          endsAt: this.endsAt(),
          status,
          customFields: this.fieldValues(),
        },
        user.fullName,
      )
      .subscribe({
        next: (reservation) => this.router.navigate(['/reservas', reservation.id]),
        error: (error: unknown) => {
          this.submitting.set(false);
          if (error instanceof ReservationConflictError) {
            this.conflict.set(error.conflict);
            return;
          }
          this.submitError.set('No se pudo crear la reserva. Intenta nuevamente.');
        },
      });
  }

  /** Vuelve al paso de fecha y horario para elegir otro horario tras un conflicto. */
  chooseAnotherSlot(): void {
    this.conflict.set(null);
    this.step.set(2);
  }

  chooseAlternative(id: string): void {
    this.resourceId.set(id);
  }
}
