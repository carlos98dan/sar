import { Component, input } from '@angular/core';

/** Indicador numérico con etiqueta y texto de apoyo. A diferencia de StatCard, no navega a otra pantalla. */
@Component({
  selector: 'app-metric-card',
  templateUrl: './metric-card.html',
  host: { class: 'flex flex-col gap-space-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-space-lg' },
})
export class MetricCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>('');
}
