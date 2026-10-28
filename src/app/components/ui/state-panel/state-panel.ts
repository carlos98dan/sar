import { Component, computed, input } from '@angular/core';

export type StatePanelKind = 'loading' | 'empty' | 'error' | 'denied' | 'pending';

const STATE_TEXT: Record<StatePanelKind, { icon: string; title: string }> = {
  loading: { icon: 'progress_activity', title: 'Cargando información' },
  pending: { icon: 'construction', title: 'Módulo en construcción' },
  empty: { icon: 'inbox', title: 'No hay resultados' },
  error: { icon: 'error', title: 'No se pudo completar la acción' },
  denied: { icon: 'lock', title: 'Acceso restringido' },
};

@Component({
  selector: 'app-state-panel',
  templateUrl: './state-panel.html',
})
export class StatePanel {
  readonly kind = input<StatePanelKind>('empty');
  readonly message = input<string>('');

  readonly text = computed(() => STATE_TEXT[this.kind()]);
}
