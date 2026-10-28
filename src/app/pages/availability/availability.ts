import { Component, computed, inject, signal } from '@angular/core';
import { combineLatest } from 'rxjs';

import { Alert } from '../../components/ui/alert/alert';
import { Badge, BadgeTone } from '../../components/ui/badge/badge';
import { Button } from '../../components/ui/button/button';
import { FormField } from '../../components/ui/form-field/form-field';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { Resource, ResourceAvailability } from '../../core/models/resource.model';
import { ReservationService } from '../../core/services/reservation.service';
import { ResourceService } from '../../core/services/resource.service';
import {
  AvailabilityWindow,
  WindowEvaluation,
  evaluateWindow,
  isValidWindow,
} from '../../core/utils/availability';
import { toDateKey } from '../../core/utils/time';
import { viewStateSignal } from '../../core/utils/view-state';

const DEFAULT_FROM = '08:00';
const DEFAULT_TO = '10:00';

const UNAVAILABLE_META: Partial<Record<ResourceAvailability, { label: string; tone: BadgeTone }>> =
  {
    maintenance: { label: 'Mantenimiento', tone: 'warning' },
    out_of_service: { label: 'Fuera de servicio', tone: 'danger' },
  };

const STATUS_ORDER: Record<WindowEvaluation['status'], number> = {
  available: 0,
  booked: 1,
  unavailable: 2,
};

interface SlotRow {
  resource: Resource;
  status: WindowEvaluation['status'];
  label: string;
  tone: BadgeTone;
  detail: string;
}

function formatTime(isoDateTime: string): string {
  return isoDateTime.slice(11, 16);
}

function toRow(resource: Resource, evaluation: WindowEvaluation): SlotRow {
  if (evaluation.reservation) {
    const { reservation } = evaluation;
    return {
      resource,
      status: evaluation.status,
      label: 'Reservado',
      tone: 'primary',
      detail: `${reservation.code} · ${reservation.title} (${formatTime(reservation.startsAt)} – ${formatTime(reservation.endsAt)})`,
    };
  }

  if (evaluation.status === 'available') {
    return {
      resource,
      status: 'available',
      label: 'Disponible',
      tone: 'success',
      detail: 'Libre en toda la franja',
    };
  }

  const meta = UNAVAILABLE_META[resource.availability] ?? {
    label: 'No disponible',
    tone: 'danger' as const,
  };
  return {
    resource,
    status: 'unavailable',
    label: meta.label,
    tone: meta.tone,
    detail: 'No se puede reservar',
  };
}

@Component({
  selector: 'app-availability',
  imports: [Alert, Badge, Button, FormField, PageHeader, StatePanel, TableShell],
  templateUrl: './availability.html',
})
export class Availability {
  private readonly resourceService = inject(ResourceService);
  private readonly reservationService = inject(ReservationService);

  readonly data = viewStateSignal(
    combineLatest([this.resourceService.list(), this.reservationService.list()]),
  );

  readonly date = signal(toDateKey(new Date()));
  readonly from = signal(DEFAULT_FROM);
  readonly to = signal(DEFAULT_TO);
  readonly category = signal('all');
  readonly minCapacity = signal(0);
  readonly onlyAvailable = signal(false);

  private readonly slot = computed<AvailabilityWindow>(() => ({
    date: this.date(),
    from: this.from(),
    to: this.to(),
  }));

  readonly validWindow = computed(() => isValidWindow(this.slot()));

  readonly categories = computed(() => {
    const state = this.data();
    if (state.status !== 'ready') {
      return [];
    }
    return [...new Set(state.data[0].map((resource) => resource.category))].sort();
  });

  /** Recursos que cumplen los filtros de categoría y capacidad, con su estado en la franja. */
  readonly evaluated = computed<SlotRow[]>(() => {
    const state = this.data();
    if (state.status !== 'ready' || !this.validWindow()) {
      return [];
    }

    const [resources, reservations] = state.data;
    const slot = this.slot();
    const category = this.category();
    const minCapacity = this.minCapacity();

    return resources
      .filter(
        (resource) =>
          (category === 'all' || resource.category === category) &&
          resource.capacity >= minCapacity,
      )
      .map((resource) => toRow(resource, evaluateWindow(resource, reservations, slot)))
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          a.resource.name.localeCompare(b.resource.name),
      );
  });

  readonly availableCount = computed(
    () => this.evaluated().filter((row) => row.status === 'available').length,
  );

  readonly rows = computed(() =>
    this.onlyAvailable()
      ? this.evaluated().filter((row) => row.status === 'available')
      : this.evaluated(),
  );

  clearFilters(): void {
    this.date.set(toDateKey(new Date()));
    this.from.set(DEFAULT_FROM);
    this.to.set(DEFAULT_TO);
    this.category.set('all');
    this.minCapacity.set(0);
    this.onlyAvailable.set(false);
  }
}
