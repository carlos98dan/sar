import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { combineLatest } from 'rxjs';

import { Alert } from '../../components/ui/alert/alert';
import { Badge } from '../../components/ui/badge/badge';
import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { Reservation } from '../../core/models/reservation.model';
import { Block, BlockType, OperationsStore } from '../../core/services/operations.store';
import { ReservationService } from '../../core/services/reservation.service';
import { ResourceService } from '../../core/services/resource.service';
import { UserService } from '../../core/services/user.service';
import { reservationsAffectedBy } from '../../core/utils/blocks';
import { toDateKey } from '../../core/utils/time';
import { viewStateSignal } from '../../core/utils/view-state';

const TYPE_LABELS: Record<BlockType, string> = {
  mantenimiento: 'Mantenimiento',
  limpieza: 'Limpieza',
  evento: 'Evento interno',
  cierre: 'Cierre',
  festivo: 'Festivo',
  administrativo: 'Bloqueo administrativo',
};

/** Periodos en los que un recurso o todas las sedes no aceptan reservas: mantenimiento, limpieza, eventos y cierres. */
@Component({
  selector: 'app-blocks',
  imports: [DatePipe, Alert, Badge, Button, PageHeader, StatePanel, TableShell],
  templateUrl: './blocks.html',
})
export class Blocks {
  private readonly operations = inject(OperationsStore);
  private readonly reservationService = inject(ReservationService);
  private readonly resourceService = inject(ResourceService);
  private readonly userService = inject(UserService);

  readonly data = viewStateSignal(
    combineLatest([
      this.resourceService.list(),
      this.reservationService.list(),
      this.userService.current(),
    ]),
  );

  readonly typeLabels = TYPE_LABELS;
  readonly types = Object.keys(TYPE_LABELS) as BlockType[];
  readonly blocks = this.operations.blocks;

  readonly resources = computed(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[0] : [];
  });

  readonly reservations = computed<Reservation[]>(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[1] : [];
  });

  readonly actor = computed(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data[2].fullName : '';
  });

  readonly type = signal<BlockType>('mantenimiento');
  /** `''` significa todas las sedes. */
  readonly resourceId = signal('');
  readonly date = signal(toDateKey(new Date()));
  readonly from = signal('08:00');
  readonly to = signal('18:00');
  readonly endDate = signal(toDateKey(new Date()));
  readonly reason = signal('');
  /** Qué hacer con las reservas afectadas: cancelarlas o solo notificar a los solicitantes. */
  readonly affectedPolicy = signal<'cancel' | 'notify' | ''>('');

  readonly candidate = computed<Block>(() => {
    const resource = this.resources().find((item) => item.id === this.resourceId());
    return {
      id: 'candidate',
      type: this.type(),
      resourceId: resource?.id ?? null,
      resourceName: resource?.name ?? 'Todas las sedes',
      startsAt: `${this.date()}T${this.from()}:00-05:00`,
      endsAt: `${this.endDate()}T${this.to()}:00-05:00`,
      reason: this.reason(),
      responsible: this.actor(),
    };
  });

  readonly windowValid = computed(() => this.candidate().endsAt > this.candidate().startsAt);

  /** Reservas activas o pendientes que el bloqueo afectaría. */
  readonly affected = computed<Reservation[]>(() =>
    this.windowValid() ? reservationsAffectedBy(this.candidate(), this.reservations()) : [],
  );

  readonly canSave = computed(() => {
    if (!this.windowValid() || this.reason().trim().length < 5) {
      return false;
    }
    return this.affected().length === 0 || this.affectedPolicy() !== '';
  });

  save(): void {
    if (!this.canSave()) {
      return;
    }
    const block: Block = {
      ...this.candidate(),
      id: `blk-${Date.now()}`,
      reason: this.reason().trim(),
    };
    const affected = this.affected();
    const policy = this.affectedPolicy();

    this.operations.addBlock(block);

    if (policy === 'cancel') {
      for (const reservation of affected) {
        this.reservationService
          .changeStatus(
            reservation,
            'cancelled',
            'Cancelada por bloqueo',
            this.actor(),
            block.reason,
          )
          .subscribe();
      }
    }

    this.reason.set('');
    this.affectedPolicy.set('');
  }
}
