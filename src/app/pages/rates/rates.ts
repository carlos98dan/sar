import { Component, computed, inject, signal } from '@angular/core';
import { Alert } from '../../components/ui/alert/alert';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { Resource } from '../../core/models/resource.model';
import { OperationsStore } from '../../core/services/operations.store';
import { ResourceService } from '../../core/services/resource.service';
import { viewStateSignal } from '../../core/utils/view-state';

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Tarifa por hora de cada recurso en COP, con simulación del costo de una reserva. */
@Component({
  selector: 'app-rates',
  imports: [Alert, PageHeader, StatePanel, TableShell],
  templateUrl: './rates.html',
})
export class Rates {
  private readonly operations = inject(OperationsStore);
  private readonly resourceService = inject(ResourceService);

  readonly data = viewStateSignal(this.resourceService.list());
  readonly rates = this.operations.rates;

  readonly resources = computed<Resource[]>(() => {
    const state = this.data();
    return state.status === 'ready' ? state.data : [];
  });

  readonly savedMessage = signal<string | null>(null);

  readonly simResourceId = signal('');
  readonly simHours = signal(2);

  readonly simTotal = computed(() => {
    const rate = this.rates()[this.simResourceId()] ?? 0;
    return rate * this.simHours();
  });

  formatCop(value: number): string {
    return COP.format(value);
  }

  setRate(resourceId: string, value: string): void {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
      return;
    }
    this.operations.setRate(resourceId, amount);
    this.savedMessage.set('Tarifa actualizada en esta sesión.');
  }
}
