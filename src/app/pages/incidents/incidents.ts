import { Component, computed, inject, signal } from '@angular/core';

import { Badge, BadgeTone } from '../../components/ui/badge/badge';
import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import {
  IncidentPriority,
  IncidentStatus,
  Incident,
  OperationsStore,
} from '../../core/services/operations.store';
import { UserService } from '../../core/services/user.service';
import { ResourceService } from '../../core/services/resource.service';
import { viewStateSignal } from '../../core/utils/view-state';
import { combineLatest } from 'rxjs';
import { DatePipe } from '@angular/common';

const PRIORITY_META: Record<IncidentPriority, { label: string; tone: BadgeTone }> = {
  baja: { label: 'Baja', tone: 'neutral' },
  media: { label: 'Media', tone: 'warning' },
  alta: { label: 'Alta', tone: 'danger' },
};

const STATUS_META: Record<IncidentStatus, { label: string; tone: BadgeTone }> = {
  abierta: { label: 'Abierta', tone: 'warning' },
  en_proceso: { label: 'En proceso', tone: 'primary' },
  resuelta: { label: 'Resuelta', tone: 'success' },
};

/** Incidencias asociadas a un recurso: reporte, prioridad, responsable y seguimiento hasta resolverla. */
@Component({
  selector: 'app-incidents',
  imports: [DatePipe, Badge, Button, PageHeader, StatePanel, TableShell],
  templateUrl: './incidents.html',
})
export class Incidents {
  private readonly operations = inject(OperationsStore);
  private readonly userService = inject(UserService);
  private readonly resourceService = inject(ResourceService);

  readonly data = viewStateSignal(
    combineLatest([this.resourceService.list(), this.userService.current()]),
  );

  readonly priorityMeta = PRIORITY_META;
  readonly statusMeta = STATUS_META;
  readonly incidents = this.operations.incidents;

  readonly resources = computed(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[0] : [];
  });

  readonly formOpen = signal(false);
  readonly resourceId = signal('');
  readonly description = signal('');
  readonly priority = signal<IncidentPriority>('media');

  readonly openCount = computed(
    () => this.incidents().filter((item) => item.status !== 'resuelta').length,
  );

  readonly canSave = computed(
    () => this.resourceId() !== '' && this.description().trim().length >= 10,
  );

  toggleForm(): void {
    this.formOpen.update((open) => !open);
  }

  save(): void {
    const resource = this.resources().find((item) => item.id === this.resourceId());
    const state = this.data();
    if (!resource || state.status !== 'ready' || !this.canSave()) {
      return;
    }

    const count = this.incidents().length + 1;
    const incident: Incident = {
      id: `inc-${Date.now()}`,
      code: `INC-${String(41 + count).padStart(4, '0')}`,
      resourceName: resource.name,
      description: this.description().trim(),
      priority: this.priority(),
      status: 'abierta',
      responsible: state.data[1].fullName,
      reportedAt: new Date().toISOString(),
    };
    this.operations.addIncident(incident);
    this.resourceId.set('');
    this.description.set('');
    this.priority.set('media');
    this.formOpen.set(false);
  }

  advance(incident: Incident): void {
    const next: IncidentStatus = incident.status === 'abierta' ? 'en_proceso' : 'resuelta';
    this.operations.setIncidentStatus(incident.id, next);
  }

  nextLabel(status: IncidentStatus): string {
    return status === 'abierta' ? 'Iniciar atención' : 'Marcar resuelta';
  }
}
