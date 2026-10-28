import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';

import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { MetricCard } from '../../components/ui/metric-card/metric-card';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { ReservationService } from '../../core/services/reservation.service';
import { ResourceService } from '../../core/services/resource.service';
import { toDateKey } from '../../core/utils/time';
import { viewStateSignal } from '../../core/utils/view-state';

const STATUS_LABELS: Record<ReservationStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  adjustments_requested: 'Requiere ajustes',
  confirmed: 'Confirmada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  in_progress: 'En curso',
  completed: 'Finalizada',
  no_show: 'No asistió',
};

/** Estados que cuentan como reservas efectivamente atendidas. */
const ATTENDED: ReservationStatus[] = ['in_progress', 'completed'];

interface ReservationRow extends Reservation {
  category: string;
}

interface Breakdown {
  label: string;
  count: number;
  hours: number;
  share: number;
}

function hoursBetween(startsAt: string, endsAt: string): number {
  return Math.round(((Date.parse(endsAt) - Date.parse(startsAt)) / 3_600_000) * 10) / 10;
}

function percent(part: number, total: number): string {
  return total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`;
}

/** Cada celda se escapa para que comas, comillas y saltos de línea no rompan el CSV. */
function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Indicadores y desgloses de reservas por rango de fechas y categoría, con exportación a CSV. */
@Component({
  selector: 'app-reports',
  imports: [FormsModule, Button, PageHeader, StatePanel, TableShell, MetricCard],
  templateUrl: './reports.html',
})
export class Reports {
  private readonly reservationService = inject(ReservationService);
  private readonly resourceService = inject(ResourceService);

  readonly statusLabels = STATUS_LABELS;
  readonly data = viewStateSignal(
    combineLatest([this.reservationService.list(), this.resourceService.list()]),
  );

  readonly from = signal(this.firstDayOfMonth());
  readonly to = signal(toDateKey(new Date()));
  readonly category = signal('all');

  readonly categories = computed(() => {
    const state = this.data();
    if (state.status !== 'ready') {
      return [];
    }
    return [...new Set(state.data[1].map((resource) => resource.category))].sort();
  });

  /** Reservas con su categoría, tomada del recurso. */
  readonly rows = computed<ReservationRow[]>(() => {
    const state = this.data();
    if (state.status !== 'ready') {
      return [];
    }
    const [reservations, resources] = state.data;
    const categoryById = new Map(resources.map((resource) => [resource.id, resource.category]));
    return reservations.map((reservation) => ({
      ...reservation,
      category: categoryById.get(reservation.resource.id) ?? 'Sin categoría',
    }));
  });

  readonly filtered = computed(() =>
    this.rows().filter(
      (row) =>
        row.startsAt.slice(0, 10) >= this.from() &&
        row.startsAt.slice(0, 10) <= this.to() &&
        (this.category() === 'all' || row.category === this.category()),
    ),
  );

  readonly kpis = computed(() => {
    const rows = this.filtered();
    const total = rows.length;
    const count = (statuses: ReservationStatus[]) =>
      rows.filter((row) => statuses.includes(row.status)).length;
    const attended = count(ATTENDED);

    return {
      total,
      approved: count(['confirmed', 'in_progress', 'completed']),
      cancelledOrRejected: count(['cancelled', 'rejected']),
      noShow: count(['no_show']),
      approvedRate: percent(count(['confirmed', 'in_progress', 'completed']), total),
      cancelledRate: percent(count(['cancelled', 'rejected']), total),
      noShowRate: percent(count(['no_show']), total),
      attendees: rows
        .filter((row) => ATTENDED.includes(row.status))
        .reduce((sum, row) => sum + row.attendees, 0),
    };
  });

  readonly byStatus = computed<Breakdown[]>(() => {
    const rows = this.filtered();
    const total = rows.length;
    return (Object.keys(STATUS_LABELS) as ReservationStatus[])
      .map((status) => {
        const matching = rows.filter((row) => row.status === status);
        return {
          label: STATUS_LABELS[status],
          count: matching.length,
          hours:
            Math.round(
              matching.reduce((sum, row) => sum + hoursBetween(row.startsAt, row.endsAt), 0) * 10,
            ) / 10,
          share: total === 0 ? 0 : matching.length / total,
        };
      })
      .filter((item) => item.count > 0);
  });

  readonly byCategory = computed<Breakdown[]>(() => this.breakdown((row) => row.category));

  readonly byResource = computed<Breakdown[]>(() =>
    this.breakdown((row) => row.resource.name).sort((a, b) => b.hours - a.hours),
  );

  readonly hasRange = computed(() => this.from() <= this.to());

  percentOf(share: number): string {
    return `${Math.round(share * 100)}%`;
  }

  /** Agrupa las reservas filtradas por una clave y suma reservas, horas y participación. */
  private breakdown(keyOf: (row: ReservationRow) => string): Breakdown[] {
    const rows = this.filtered();
    const groups = new Map<string, ReservationRow[]>();
    for (const row of rows) {
      const key = keyOf(row);
      groups.set(key, [...(groups.get(key) ?? []), row]);
    }
    return [...groups.entries()]
      .map(([label, items]) => ({
        label,
        count: items.length,
        hours:
          Math.round(
            items.reduce((sum, row) => sum + hoursBetween(row.startsAt, row.endsAt), 0) * 10,
          ) / 10,
        share: rows.length === 0 ? 0 : items.length / rows.length,
      }))
      .sort((a, b) => b.count - a.count);
  }

  exportCsv(): void {
    const header = [
      'Código',
      'Título',
      'Recurso',
      'Categoría',
      'Solicitante',
      'Inicio',
      'Fin',
      'Estado',
      'Asistentes',
    ];
    const lines = this.filtered().map((row) =>
      [
        row.code,
        row.title,
        row.resource.name,
        row.category,
        row.requester.name,
        row.startsAt,
        row.endsAt,
        STATUS_LABELS[row.status],
        String(row.attendees),
      ]
        .map(csvCell)
        .join(','),
    );
    // BOM para que Excel reconozca los acentos.
    const content = `﻿${[header.map(csvCell).join(','), ...lines].join('\n')}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservas-${this.from()}-${this.to()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private firstDayOfMonth(): string {
    const now = new Date();
    return toDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
  }
}
