import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationStatusBadge } from '../../components/ui/reservation-status-badge/reservation-status-badge';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { Resource } from '../../core/models/resource.model';
import { ReservationService } from '../../core/services/reservation.service';
import { ResourceService } from '../../core/services/resource.service';
import { isoTimeToMinutes, toDateKey } from '../../core/utils/time';
import { viewStateSignal } from '../../core/utils/view-state';

/** Franja visible del calendario: 07:00 a 21:00. */
const DAY_START = 7 * 60;
const DAY_END = 21 * 60;
const DAY_SPAN = DAY_END - DAY_START;

/** Estados que no ocupan el recurso en el calendario. */
const INACTIVE_STATUSES: ReservationStatus[] = ['cancelled', 'rejected', 'no_show'];

type BlockKind = 'booked' | 'pending' | 'inactive';

interface TimeBlock {
  reservation: Reservation;
  kind: BlockKind;
  /** Porcentaje dentro de la franja visible. */
  left: number;
  width: number;
  start: number;
  end: number;
  conflict: boolean;
}

interface CalendarRow {
  resource: Resource;
  blocks: TimeBlock[];
}

@Component({
  selector: 'app-calendar',
  imports: [DatePipe, PageHeader, ReservationStatusBadge, RouterLink, StatePanel, TableShell],
  templateUrl: './calendar.html',
})
export class Calendar {
  private readonly reservationService = inject(ReservationService);
  private readonly resourceService = inject(ResourceService);

  readonly reservations = viewStateSignal(this.reservationService.list());
  readonly resources = viewStateSignal(this.resourceService.list());

  readonly date = signal(toDateKey(new Date()));
  readonly selected = signal<Reservation | null>(null);

  readonly hours = Array.from({ length: DAY_SPAN / 60 }, (_, index) =>
    `${String(DAY_START / 60 + index).padStart(2, '0')}:00`,
  );

  readonly status = computed(() => {
    const resources = this.resources();
    const reservations = this.reservations();
    if (resources.status === 'error' || reservations.status === 'error') {
      return 'error';
    }
    if (resources.status === 'loading' || reservations.status === 'loading') {
      return 'loading';
    }
    return 'ready';
  });

  /** Filas por recurso con sus bloques de reserva para la fecha seleccionada. */
  readonly rows = computed<CalendarRow[]>(() => {
    const resources = this.resources();
    const reservations = this.reservations();
    if (resources.status !== 'ready' || reservations.status !== 'ready') {
      return [];
    }

    const day = this.date();

    return resources.data.map((resource) => {
      const blocks: TimeBlock[] = reservations.data
        .filter((reservation) => reservation.resource.id === resource.id && reservation.startsAt.startsWith(day))
        .map((reservation) => {
          const start = isoTimeToMinutes(reservation.startsAt);
          const end = isoTimeToMinutes(reservation.endsAt);
          const kind: BlockKind = INACTIVE_STATUSES.includes(reservation.status)
            ? 'inactive'
            : reservation.status === 'confirmed' || reservation.status === 'in_progress' || reservation.status === 'completed'
              ? 'booked'
              : 'pending';

          return {
            reservation,
            kind,
            left: ((start - DAY_START) / DAY_SPAN) * 100,
            width: ((end - start) / DAY_SPAN) * 100,
            start,
            end,
            conflict: false,
          };
        });

      // Un bloque activo en conflicto es el que se solapa con otro bloque activo de la misma fila.
      const active = blocks.filter((block) => block.kind !== 'inactive');
      for (const block of active) {
        block.conflict = active.some(
          (other) => other !== block && other.start < block.end && block.start < other.end,
        );
      }

      return { resource, blocks };
    });
  });

  readonly conflictCount = computed(() => this.rows().reduce((total, row) => total + row.blocks.filter((block) => block.conflict).length, 0));

  shiftDate(days: number): void {
    const [year, month, day] = this.date().split('-').map(Number);
    this.date.set(toDateKey(new Date(year, month - 1, day + days)));
    this.selected.set(null);
  }

  goToToday(): void {
    this.date.set(toDateKey(new Date()));
    this.selected.set(null);
  }

  blockClasses(block: TimeBlock): string {
    const base = 'absolute top-1.5 bottom-1.5 flex flex-col items-start overflow-hidden rounded border px-space-sm py-space-xs text-left text-label-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-container';
    const kind: Record<BlockKind, string> = {
      booked: 'border-primary-container bg-primary-fixed text-on-primary-fixed-variant',
      pending: 'border-warning bg-warning-container text-on-surface',
      inactive: 'border-outline-variant bg-surface-container-low text-secondary line-through',
    };
    return `${base} ${kind[block.kind]}${block.conflict ? ' ring-2 ring-danger ring-inset' : ''}`;
  }
}
